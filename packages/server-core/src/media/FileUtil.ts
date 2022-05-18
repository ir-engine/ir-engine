import fs from 'fs'
import path from 'path'

import { StorageProviderInterface } from './storageprovider/storageprovider.interface'

export const copyRecursiveSync = function (src: string, dest: string): void {
  if (!fs.existsSync(src)) return

  if (fs.lstatSync(src).isDirectory()) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

export const getIncrementalName = async function (
  name: string,
  directoryPath: string,
  store: StorageProviderInterface,
  isDirectory?: boolean
): Promise<string> {
  let filename = name

  if (!(await store.doesExist(filename, directoryPath))) return filename

  let count = 1

  if (isDirectory) {
    do {
      filename = `${name}(${count})`
      count++
    } while (await store.doesExist(filename, directoryPath))
  } else {
    const extension = path.extname(name)
    const baseName = path.basename(name, extension)

    do {
      filename = `${baseName}(${count})${extension}`
      count++
    } while (await store.doesExist(filename, directoryPath))
  }

  return filename
}
