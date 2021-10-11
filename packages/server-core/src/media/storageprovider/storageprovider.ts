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
  getObject = (key: string): Promise<any> => this.provider.getObject(key)
  listObjects = (prefix: string): Promise<any> => this.provider.listObjects(prefix)
  putObject = (object: any): Promise<any> => this.provider.putObject(object)
  deleteResources = (keys: string[]): Promise<any> => this.provider.deleteResources(keys)
  createInvalidation = (params: any): Promise<any> => this.provider.createInvalidation(params)

  listFolderContent = (folderName: string): Promise<any> => this.provider.listFolderContent(folderName)
  createDirectory = (dir): Promise<boolean> => this.provider.createDirectory(dir)
  moveContent = (current: string, destination: string): Promise<boolean> =>
    this.provider.moveContent(current, destination)
  deleteContent = (contentPath: string, type: string): Promise<any> => this.provider.deleteContent(contentPath, type)
}
export default StorageProvider
