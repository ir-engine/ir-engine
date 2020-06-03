import S3Storage from './s3.storage'
import LocalStorage from './local.storage'
import IStorageProvider from './storageprovider.interface'
import config from '../config'

export default class StorageProvider implements IStorageProvider {
  provider: IStorageProvider
  constructor () {
    this.provider = config.server.storageProvider === 'aws'
      ? new S3Storage()
      : new LocalStorage()
  }

  getProvider = (): IStorageProvider => this.provider
  getStorage = (): any => this.provider.getStorage()
}
