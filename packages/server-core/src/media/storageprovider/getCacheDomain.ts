import config from '../../appconfig'
import { StorageProviderInterface } from './storageprovider.interface'

/**
 * Returns the cache domain for the provided storage provider. If running inside minikube and is an internal request, returns the internal minikube address.
 * @param storageProvider the storage provider
 * @param internal true if the request is coming from inside a server, only relevant when run from minikube
 * @returns {string}
 */
export const getCacheDomain = (storageProvider: StorageProviderInterface, internal = false) => {
  if (config.server.storageProvider === 'local' && config.kubernetes.enabled && internal)
    return config.server.localStorageProviderPort
      ? `host.minikube.internal:${config.server.localStorageProviderPort}`
      : 'host.minikube.internal'
  return storageProvider.cacheDomain
}
