import S3Storage from './s3.storage'
import LocalStorage from './local.storage'
import { StorageProviderInterface } from './storageprovider.interface'
import config from '../../appconfig'

const provider: StorageProviderInterface =
  config.server.storageProvider !== 'aws' ? new LocalStorage() : new S3Storage()

export const useStorageProvider = () => provider
