import config from '../../appconfig'
import LocalStorage from './local.storage'
import S3Storage from './s3.storage'
import { StorageProviderInterface } from './storageprovider.interface'

const provider: StorageProviderInterface =
  config.server.storageProvider !== 'aws' && config.server.storageProvider !== 'ipfs'
    ? new LocalStorage()
    : new S3Storage()

export const useStorageProvider = () => provider
