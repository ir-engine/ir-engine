import config from '../../appconfig'

export const getCachedAsset = (path: string, cacheDomain: string, internal = false) => {
  if (!cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')
  if (config.server.storageProvider === 'local' && config.kubernetes.enabled && internal)
    cacheDomain = config.server.localStorageProviderPort
      ? `host.minikube.internal:${config.server.localStorageProviderPort}`
      : 'host.minikube.internal'
  return new URL(path ?? '', 'https://' + cacheDomain).href
}
