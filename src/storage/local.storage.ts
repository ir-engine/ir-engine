
import fs from 'fs-blob-store'
import IStorageProvider from './storageprovider.interface'

export default class LocalStorage implements IStorageProvider {
  path = './upload'

  getProvider = (): IStorageProvider => new LocalStorage()
  getStorage = (): any => fs(this.path)
}
