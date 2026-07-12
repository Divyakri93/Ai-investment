let memoryWatchlist = [];

export const getWatchlist = () => [...memoryWatchlist];

export const toggleWatchlist = (item) => {
  if (!item) return getWatchlist();
  const identifier = item.resolvedTicker || item.ticker || item.companyName;
  const exists = memoryWatchlist.some(
    (i) => (i.resolvedTicker || i.ticker || i.companyName) === identifier
  );
  if (exists) {
    memoryWatchlist = memoryWatchlist.filter(
      (i) => (i.resolvedTicker || i.ticker || i.companyName) !== identifier
    );
  } else {
    memoryWatchlist.push({
      ...item,
      ticker: item.resolvedTicker || item.ticker || 'N/A',
      companyName: item.companyName || item.resolvedCompanyName || 'Unknown'
    });
  }
  return getWatchlist();
};

export const isInWatchlist = (item) => {
  if (!item) return false;
  const identifier = item.resolvedTicker || item.ticker || item.companyName;
  return memoryWatchlist.some(
    (i) => (i.resolvedTicker || i.ticker || i.companyName) === identifier
  );
};
