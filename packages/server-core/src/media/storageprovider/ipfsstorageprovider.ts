import FleekIPFSStorage from './fleekipfs.storage'
import LocalStorage from './local.storage'
import { IPFSStorageProviderInterface } from './ipfsstorageprovider.interface'
import config from '../../appconfig'

const provider: IPFSStorageProviderInterface = new FleekIPFSStorage()
//config.server.ipfsStorageProvider === 'fleek' ? new FleekIPFSStorage() : new LocalStorage()

export const useIPFSStorageProvider = () => provider
