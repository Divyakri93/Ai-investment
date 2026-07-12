import dotenv from 'dotenv';
import { MissingApiKeyError, DataFetchError } from '../model.js';
dotenv.config();

export async function fetchCompanyFundamentals(ticker, companyName = ticker) {
  const normalizedTicker = (ticker || '').toUpperCase().replace('.NS', '');
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey || apiKey === 'your_fmp_api_key_here') {
    throw new MissingApiKeyError('FMP_API_KEY not configured in .env');
  }

  // 1. First attempt stable profile lookup for ticker
  const res = await fetch(
    `https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(normalizedTicker)}&apikey=${apiKey}`,
    { signal: AbortSignal.timeout(12000) }
  );

  if (!res.ok) {
    throw new DataFetchError(`FMP API request failed with status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  let profile = (Array.isArray(data) && data.length > 0) ? data[0] : null;

  // 2. If no profile record found for ticker, try searching FMP for the company name
  if (!profile && companyName && companyName !== normalizedTicker) {
    try {
      const searchRes = await fetch(
        `https://financialmodelingprep.com/stable/search?query=${encodeURIComponent(companyName)}&apikey=${apiKey}`,
        { signal: AbortSignal.timeout(12000) }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData) && searchData.length > 0 && searchData[0].symbol) {
          const altSymbol = searchData[0].symbol;
          const altProfileRes = await fetch(
            `https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(altSymbol)}&apikey=${apiKey}`
          );
          if (altProfileRes.ok) {
            const altProfileData = await altProfileRes.json();
            if (Array.isArray(altProfileData) && altProfileData.length > 0) {
              profile = altProfileData[0];
            }
          }
        }
      }
    } catch (e) {
      // Ignore search fallback error
    }
  }

  // 3. If still no profile record found, treat as private or non-independently publicly traded company
  if (!profile) {
    const displayName = companyName || normalizedTicker;
    return {
      isPubliclyTraded: false,
      ticker: normalizedTicker,
      companyName: displayName,
      publicStatusMessage: `${displayName} is not an independently publicly traded company — fundamentals data is not available via public market APIs. Proceeding with qualitative research only.`,
      marketCap: null,
      peRatio: null,
      revenueGrowthYoY: null,
      freeCashFlow: null,
      debtToEquity: null,
      grossMargin: null,
      operatingMargin: null,
      currency: 'USD',
      source: 'Qualitative Research Only (Private / Unlisted)'
    };
  }

  return {
    isPubliclyTraded: true,
    ticker: profile.symbol || normalizedTicker,
    companyName: profile.companyName || companyName || normalizedTicker,
    marketCap: profile.marketCap ?? profile.mktCap ?? null,
    peRatio: profile.peRatio ?? profile.pe ?? null,
    revenueGrowthYoY: null,
    freeCashFlow: null,
    debtToEquity: null,
    grossMargin: null,
    operatingMargin: null,
    currency: profile.currency || 'USD',
    source: 'Financial Modeling Prep Live API'
  };
}
