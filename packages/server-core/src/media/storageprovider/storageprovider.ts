import config from '../../appconfig'
import IPFSStorage from './ipfs.storage'
import LocalStorage from './local.storage'
import S3Storage from './s3.storage'
import { StorageProviderInterface } from './storageprovider.interface'

const providers = {} as { [constructor: string]: StorageProviderInterface }

export const getStorageProvider = (provider = 'default') => providers[provider]

interface StorageProviderConstructor {
  new (): StorageProviderInterface
}

export const createStorageProvider = (constructor: StorageProviderConstructor) => {
  const storageProvider = new constructor()
  providers[constructor.name] = storageProvider
  return storageProvider
}

export const createIPFSStorageProvider = async () => {
  const IPFSProvider = new IPFSStorage()
  const podName = await IPFSProvider.getIPFSPod()

  if (!podName) {
    return console.log('Tried to initialize IPFS storage provider but could not communicate with the pod.')
  }

  await IPFSProvider.initialize(podName)

  providers['ipfs'] = IPFSProvider
  return IPFSProvider
}

export const createDefaultStorageProvider = () => {
  const StorageProvider =
    config.server.storageProvider !== 'aws' && config.server.storageProvider !== 'ipfs' ? LocalStorage : S3Storage
  const provider = createStorageProvider(StorageProvider)
  providers['default'] = provider
  return provider
}
