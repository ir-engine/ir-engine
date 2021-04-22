import fs from 'fs-blob-store';
import { StorageProviderInterface } from './storageprovider.interface';

export class LocalStorage implements StorageProviderInterface {
  path = './upload'

  getProvider = (): StorageProviderInterface => new LocalStorage()
  getStorage = (): any => fs(this.path)
}
export default LocalStorage;
