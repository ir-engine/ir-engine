
import fs from 'fs-blob-store'
import IStorageProvider from './storageprovider.interface'

export default class LocalStorage implements IStorageProvider {
  getProvider = (): IStorageProvider => new LocalStorage()
  getStorage = (): any => fs('./upload')
}
