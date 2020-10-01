import S3Storage from './s3.storage';
import LocalStorage from './local.storage';
import StorageProviderInterface from './storageprovider.interface';
import config from '../config';

export default class StorageProvider implements StorageProviderInterface {
  provider: StorageProviderInterface
  constructor () {
    this.provider = config.server.storageProvider === 'aws'
      ? new S3Storage()
      : new LocalStorage();
  }

  getProvider = (): StorageProviderInterface => this.provider
  getStorage = (): any => this.provider.getStorage()
}
