import config from '../../appconfig'

/**
 * Constructs the full URL for a cached asset based on context environment and configured cache domain
 * @param path the full key/path for the storage provider
 * @param cacheDomain the cache domain of the storage provider
 * @param internal true if the request is coming from inside a server, only relevant when run from minikube
 * @returns {string}
 */
export const getCachedAsset = (path: string, cacheDomain: string, internal = false) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  if (config.server.storageProvider === 'local' && config.kubernetes.enabled && internal)
    cacheDomain = config.server.localStorageProviderPort
      ? `host.minikube.internal:${config.server.localStorageProviderPort}`
      : 'host.minikube.internal'
  return new URL(path ?? '', 'https://' + cacheDomain).href
}
