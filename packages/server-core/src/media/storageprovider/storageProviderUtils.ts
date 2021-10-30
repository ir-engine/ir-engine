import { useStorageProvider } from './storageprovider'

const storageProvider = useStorageProvider()

export const getFileKeysRecursive = async (path: string) => {
  const files: string[] = []
  try {
    const entries = (await storageProvider.listObjects(path, true)).Contents
    if (entries.length) {
      for (const { Key } of entries) {
        files.push(Key)
      }
    }
  } catch (e) {
    console.log(e)
  }
  return files
}

export const getCachedAsset = (path: string) => {
  console.log(storageProvider.cacheDomain, path)
  return path && storageProvider.cacheDomain ? new URL(path, 'https://' + storageProvider.cacheDomain).href : ''
}
