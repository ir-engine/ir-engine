import S3Storage from './s3.storage'
import LocalStorage from './local.storage'
import { StorageObjectInterface, StorageProviderInterface } from './storageprovider.interface'
import config from '../../appconfig'

export class StorageProvider implements StorageProviderInterface {
  provider: StorageProviderInterface
  docs: any
  constructor() {
    this.provider = config.server.storageProvider === 'aws' ? new S3Storage() : new LocalStorage()
  }

  cacheDomain = ''
  checkObjectExistence = (key: string) => this.provider.checkObjectExistence(key)
  getProvider = (): StorageProviderInterface => this.provider
  getSignedUrl = (key: string, expiresAfter: number, conditions) =>
    this.provider.getSignedUrl(key, expiresAfter, conditions)
  getStorage = (): any => this.provider.getStorage()
  getObject = (key: string) => this.provider.getObject(key)
  listObjects = (prefix: string) => this.provider.listObjects(prefix)
  putObject = (object: StorageObjectInterface) => this.provider.putObject(object)
  deleteResources = (keys: string[]) => this.provider.deleteResources(keys)
  createInvalidation = (params: any) => this.provider.createInvalidation(params)
}
export default StorageProvider
