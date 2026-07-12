import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = ReadableStream;
}
if (typeof globalThis.WritableStream === 'undefined') {
  globalThis.WritableStream = WritableStream;
}
if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = TransformStream;
}
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = crypto.webcrypto || {
    getRandomValues: (arr) => crypto.randomFillSync(arr)
  };
}

if (typeof globalThis.fetch === 'undefined') {
  try {
    const undici = require('undici');
    globalThis.fetch = undici.fetch;
    globalThis.Headers = undici.Headers;
    globalThis.Request = undici.Request;
    globalThis.Response = undici.Response;
  } catch (err) {
    try {
      const nodeFetch = require('node-fetch');
      globalThis.fetch = nodeFetch;
      globalThis.Headers = nodeFetch.Headers;
      globalThis.Request = nodeFetch.Request;
      globalThis.Response = nodeFetch.Response;
    } catch (e2) {}
  }
}
