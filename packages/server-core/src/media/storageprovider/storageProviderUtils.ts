import { useStorageProvider } from './storageprovider'

const storageProvider = useStorageProvider()

export const getFileKeysRecursive = async (path: string) => {
  const files: string[] = []
  try {
    const hasSubEntries = (await storageProvider.listObjects(path)).Contents
    if (hasSubEntries.length) {
      for (const { Key } of hasSubEntries) {
        files.push(...(await getFileKeysRecursive(Key)))
      }
    }
  } catch (e) {}
  return files
}
