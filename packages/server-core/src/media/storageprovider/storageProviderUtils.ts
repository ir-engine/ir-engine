import { useStorageProvider } from './storageprovider'

const storageProvider = useStorageProvider()

export const getFileKeysRecursive = async (path: string) => {
  const files: string[] = []
  try {
    const response = await storageProvider.listObjects(path, [], true, null!)
    const entries = response.Contents
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
