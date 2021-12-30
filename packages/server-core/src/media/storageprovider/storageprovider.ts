import S3Storage from './s3.storage'
import S3IPFSStorage from './s3ipfs.storage'
import LocalStorage from './local.storage'
import { StorageProviderInterface } from './storageprovider.interface'
import config from '../../appconfig'

const provider: StorageProviderInterface =
  config.server.storageProvider === 'aws' ? new S3Storage() : new LocalStorage()

const ipfsProvider: StorageProviderInterface =
  config.server.ipfsStorageProvider === 'fleek' ? new S3IPFSStorage() : new LocalStorage()

export const useIPFSStorageProvider = () => new S3IPFSStorage()

export const useStorageProvider = () => provider
