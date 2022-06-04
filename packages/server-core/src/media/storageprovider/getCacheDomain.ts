import config from '../../appconfig'
import { StorageProviderInterface } from './storageprovider.interface'

export const getInternalCacheDomain = (storageProvider: StorageProviderInterface, internal = false) => {
  if (config.server.storageProvider === 'local' && config.kubernetes.enabled && internal)
    return config.server.localStorageProviderPort
      ? `host.minikube.internal:${config.server.localStorageProviderPort}`
      : 'host.minikube.internal'
  return storageProvider.cacheDomain
}
