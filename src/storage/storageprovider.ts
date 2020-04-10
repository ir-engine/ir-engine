import S3Storage from './s3.storage'
import LocalStorage from './local.storage'
import IStorageProvider from './storageprovider.interface'

export default class StorageProvider implements IStorageProvider {
    provider: IStorageProvider
    constructor() {
        this.provider = process.env.STORAGE_PROVIDER === 'aws' ? new S3Storage() : new LocalStorage()
    }

    getProvider = () => this.provider
    getStorage = () => this.provider.getStorage()
}
