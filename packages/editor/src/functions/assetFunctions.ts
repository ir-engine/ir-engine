import { client } from '@xrengine/client-core/src/feathers'
import { upload } from '@xrengine/client-core/src/util/upload'

export const uploadProjectAsset = async (
  projectName: string,
  files: File[],
  onProgress?
): Promise<{ url: string }[]> => {
  const promises = []
  for (const file of files) {
    const pathName = `projects/${projectName}/assets`
    promises.push(
      new Promise(async (resolve) => {
        await upload(file, onProgress, null, pathName, file.name)
        const response = await client.service('project').patch(projectName, {
          files: [`${pathName}/${file.name}`]
        })

        resolve({ url: response[0] })
      })
    )
  }
  return await Promise.all(promises)
}

export const uploadProjectAssetFromEntries = async (
  projectName: string,
  entries: FileSystemEntry[],
  onProgress?
): Promise<{ url: string }[]> => {
  const promises = []
  for (const entry of entries) {
    await processEntry(entry, projectName, '', promises, onProgress)
  }
  return await Promise.all(promises)
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
 * @param item
 */
const processEntry = async (item, projectName: string, directory: string, promises, onProgress) => {
  if (item.isDirectory) {
    let directoryReader = item.createReader()
    const entries = await getEntries(directoryReader)
    for (let index = 0; index < entries.length; index++) {
      await processEntry(entries[index], projectName, item.fullPath, promises, onProgress)
    }
  }

  if (item.isFile) {
    promises.push(
      new Promise(async (resolve) => {
        const file = await getFile(item)
        const pathName = `projects/${projectName}/assets${directory}`

        await upload(file, onProgress, null, pathName, file.name)
        const response = await client.service('project').patch(projectName, {
          files: [`${pathName}/${file.name}`]
        })

        resolve({ url: response[0] })
      })
    )
  }
}

/**
 * https://stackoverflow.com/a/53113059
 * @param fileEntry
 * @returns
 */
const getFile = async (fileEntry: FileSystemFileEntry): Promise<File> => {
  try {
    return await new Promise((resolve, reject) => fileEntry.file(resolve, reject))
  } catch (err) {
    console.log(err)
  }
}

export const getEntries = async (directoryReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
  try {
    return await new Promise((resolve, reject) => directoryReader.readEntries(resolve, reject))
  } catch (err) {
    console.log(err)
  }
}
