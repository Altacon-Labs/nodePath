export function normalizeWallet(address) {
  if (typeof address !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(address)) throw new TypeError('Expected a 20-byte EVM address');
  return address.toLowerCase();
}
export function transactionKey({ chainId, transactionHash, logIndex }) {
  if (!Number.isSafeInteger(chainId) || chainId <= 0 || !/^0x[0-9a-fA-F]{64}$/.test(transactionHash) || !Number.isSafeInteger(logIndex) || logIndex < 0) throw new TypeError('Invalid chain event identity');
  return [chainId, transactionHash.toLowerCase(), logIndex].join(':');
}
// Cohort membership and return windows are determined by callers.
export function retentionRate(cohortWallets, returningWallets) {
  const cohort = new Set(cohortWallets.map(normalizeWallet));
  const returned = new Set(returningWallets.map(normalizeWallet));
  return cohort.size ? [...cohort].filter(wallet => returned.has(wallet)).length / cohort.size : 0;
}

