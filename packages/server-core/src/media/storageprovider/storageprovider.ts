import S3Storage from './s3.storage'
import LocalStorage from './local.storage'
import { StorageProviderInterface } from './storageprovider.interface'
import config from '../../appconfig'

export class StorageProvider implements StorageProviderInterface {
  provider: StorageProviderInterface
  docs: any
  constructor() {
    this.provider = config.server.storageProvider === 'aws' ? new S3Storage() : new LocalStorage()
  }
  cacheDomain: string

  checkObjectExistence = (key: string): Promise<any> => this.provider.checkObjectExistence(key)
  getProvider = (): StorageProviderInterface => this.provider
  getSignedUrl = (key: string, expiresAfter: number, conditions): any =>
    this.provider.getSignedUrl(key, expiresAfter, conditions)
  getStorage = (): any => this.provider.getStorage()
  getObject = (key: string): Promise<any> => this.provider.getObject(key)
  listObjects = (prefix: string): Promise<any> => this.provider.listObjects(prefix)
  putObject = (object: any): Promise<any> => this.provider.putObject(object)
  deleteResources = (keys: string[]): Promise<any> => this.provider.deleteResources(keys)
  createInvalidation = (params: any): Promise<any> => this.provider.createInvalidation(params)
}
export default StorageProvider
