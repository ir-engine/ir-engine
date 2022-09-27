import logger from '../../ServerLogger'
import { getStorageProvider } from './storageprovider'

export const getFileKeysRecursive = async (path: string, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
  const files: string[] = []
  try {
    const response = await storageProvider.listObjects(path, true)
    const entries = response.Contents
    if (entries.length) {
      for (const { Key } of entries) {
        files.push(Key)
      }
    }
  } catch (e) {
    logger.error(e)
  }
  return files
}
