import config from '../../appconfig'

<<<<<<< HEAD
export const getCachedAsset = (path: string, cacheDomain: string, internal = false) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  if (config.server.storageProvider === 'local' && config.kubernetes.enabled && internal)
    cacheDomain = config.server.localStorageProviderPort
      ? `host.minikube.internal:${config.server.localStorageProviderPort}`
      : 'host.minikube.internal'
=======
export const getCachedAsset = (path: string, cacheDomain: string, clientFetch = false) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  if (config.server.storageProvider === 'local' && clientFetch) cacheDomain = 'localhost:8642'
>>>>>>> Fixed a bug with minikube client local file loading.
  return new URL(path ?? '', 'https://' + cacheDomain).href
}
