import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
dotenv.config();

export class MissingApiKeyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingApiKeyError';
  }
}

export class DataFetchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DataFetchError';
  }
}

export class LLMCallError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LLMCallError';
  }
}

export class JSONParseError extends Error {
  constructor(message, rawResponse = '') {
    super(message);
    this.name = 'JSONParseError';
    this.rawResponse = rawResponse;
  }
}

export function getModel(options = {}) {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_openai_api_key_here' || apiKey === 'your_xai_api_key_here') {
    throw new MissingApiKeyError(`LLM_API_KEY not configured in .env (provider: ${provider})`);
  }

  const temperature = options.temperature ?? 0.2;
  const fastModelOverride = process.env.FAST_MODEL_NAME;

  if (provider === 'groq') {
    const { ChatOpenAI } = require('@langchain/openai');
    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: options.modelName || fastModelOverride || 'llama-3.1-8b-instant',
      temperature,
      configuration: { baseURL: 'https://api.groq.com/openai/v1' }
    });
  } else if (provider === 'xai' || provider === 'grok') {
    const { ChatOpenAI } = require('@langchain/openai');
    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: options.modelName || fastModelOverride || 'grok-beta',
      temperature,
      configuration: { baseURL: 'https://api.x.ai/v1' }
    });
  } else if (provider === 'gemini') {
    const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
    return new ChatGoogleGenerativeAI({
      modelName: options.modelName || fastModelOverride || 'gemini-1.5-flash',
      temperature,
      apiKey
    });
  } else if (provider === 'openai') {
    const { ChatOpenAI } = require('@langchain/openai');
    return new ChatOpenAI({
      modelName: options.modelName || fastModelOverride || 'gpt-4o-mini',
      temperature,
      openAIApiKey: apiKey
    });
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export function extractAndParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new JSONParseError('Empty response from LLM', String(rawText));
  }

  let cleaned = rawText.trim();

  // 1. Strip markdown code fences if present
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(fenceRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 2. Try direct JSON.parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Continue to balanced-brace scanner
  }

  // 3. Balanced-brace scanner ignoring braces inside string literals
  let startIdx = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{' || cleaned[i] === '[') {
      startIdx = i;
      break;
    }
  }

  if (startIdx !== -1) {
    const openChar = cleaned[startIdx];
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    let endIdx = -1;

    for (let i = startIdx; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === openChar) {
          depth++;
        } else if (char === closeChar) {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }

    if (endIdx !== -1) {
      const candidate = cleaned.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(candidate);
      } catch (e1) {
        // 4. Attempt repair pass on extracted candidate
        try {
          const repaired = candidate
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/[\u0000-\u001F]+/g, ' ');
          return JSON.parse(repaired);
        } catch (e2) {
          // Fall through to throw below
        }
      }
    }
  }

  // 5. Throw clear JSONParseError with first 200 chars
  const snippet = rawText.slice(0, 200);
  throw new JSONParseError(
    `Failed to parse structured JSON from LLM response. Raw snippet (200 chars): ${snippet}`,
    rawText
  );
}

export async function withTimeout(promise, timeoutMs = 22000, errorMsg = 'Operation timed out after 22 seconds') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateStructuredJson(prompt) {
  let model;
  try {
    model = getModel({ temperature: 0.1 });
  } catch (err) {
    throw err;
  }

  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();

  try {
    let boundModel = model;
    if (provider === 'groq' || provider === 'openai' || provider === 'xai' || provider === 'grok') {
      try {
        boundModel = model.bind({ response_format: { type: 'json_object' } });
      } catch (e) {
        boundModel = model;
      }
    }

    const invokePromise = boundModel.invoke([
      ['system', 'You are a strict JSON generator. Return ONLY valid JSON matching the user requirements without markdown or commentary.'],
      ['user', prompt]
    ]);

    const response = await withTimeout(invokePromise, 22000, 'LLM generation timed out after 22s');

    const content = response.content.toString().trim();
    return extractAndParseJson(content);
  } catch (err) {
    if (err instanceof MissingApiKeyError || err instanceof JSONParseError) {
      throw err;
    }
    console.error('[generateStructuredJson] FULL ERROR:', err);
    throw new LLMCallError(`LLM call or JSON parse failed: ${err.message || String(err)}`);
  }
}
