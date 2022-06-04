/**
 * Constructs the full URL for a cached asset based on context environment and configured cache domain
 * @param path the full key/path for the storage provider
 * @param cacheDomain the cache domain of the storage provider
 * @param internal true if the request is coming from inside a server, only relevant when run from minikube
 * @returns {string}
 */
export const getCachedURL = (path: string, cacheDomain: string) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  return new URL(path ?? '', 'https://' + cacheDomain).href
}
