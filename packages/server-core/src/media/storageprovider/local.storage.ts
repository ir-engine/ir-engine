import appRootPath from 'app-root-path'
import config from '../../appconfig'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path'
import {
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'
import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

const keyPathRegex = /([a-zA-Z0-9/_-]+)\/[a-zA-Z0-9]+.[a-zA-Z0-9]+/

export class LocalStorage implements StorageProviderInterface {
  path = './upload'
  cacheDomain = config.server.localStorageProvider

  getObject = async (key: string): Promise<any> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, key)
    const result = await fs.promises.readFile(filePath)
    return { Body: result }
  }

  listObjects = async (prefix: string, recursive = false): Promise<StorageListObjectInterface> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, prefix)
    if (!fs.existsSync(filePath)) await fs.promises.mkdir(filePath, { recursive })
    const globResult = glob.sync(path.join(filePath, '**/*.*'))
    return {
      Contents: globResult.map((result) => {
        return { Key: result.replace(path.join(appRootPath.path, 'packages', 'server', this.path), '') }
      })
    }
  }

  putObject = async (params: StorageObjectInterface): Promise<any> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, params.Key)
    const pathWithoutFileExec = keyPathRegex.exec(filePath)
    if (pathWithoutFileExec == null) throw new Error('Invalid file path in local putObject')
    const pathWithoutFile = pathWithoutFileExec[1]
    const pathWithoutFileExists = fs.existsSync(pathWithoutFile)
    if (!pathWithoutFileExists) await fs.promises.mkdir(pathWithoutFile, { recursive: true })
    return fs.promises.writeFile(filePath, params.Body)
  }

  createInvalidation = async (): Promise<any> => Promise.resolve()

  getProvider = (): StorageProviderInterface => this
  getStorage = (): any => fsStore(this.path)

  checkObjectExistence = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, key)
      const exists = fs.existsSync(filePath)
      if (exists) reject(new Error('Pack already exists'))
      else resolve(null)
    })
  }

  getSignedUrl = (key: string, expiresAfter: number, conditions): any => {
    return {
      fields: {
        Key: key
      },
      url: `https://${this.cacheDomain}${key}`,
      local: true,
      cacheDomain: this.cacheDomain
    }
  }

  deleteResources(keys: string[]): Promise<any> {
    const blobs = this.getStorage()

    return Promise.all(
      keys.map((key) => {
        return new Promise((resolve) => {
          blobs.exists(key, (err, exists) => {
            if (err) {
              console.error(err)
              resolve(false)
              return
            }
            if (exists)
              blobs.remove(key, (err) => {
                if (err) {
                  console.error(err)
                  resolve(false)
                  return
                }

                resolve(true)
              })

            resolve(true)
          })
        })
      })
    )
  }

  /**
   * @author Abhishek Pathak
   * @param folderName
   * @returns
   */

  listFolderContent = async (folderName: string): Promise<any> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, folderName)
    const files = glob.sync(path.join(filePath, '*.*')).map((result) => {
      const key = result.replace(path.join(appRootPath.path, 'packages', 'server', this.path), '')
      const regexx = /(?:.*)\/(?<name>.*)\.(?<extension>.*)/g
      const query = regexx.exec(key)
      const url = this.getSignedUrl(key, 3600, null).url
      const res: FileContentType = {
        key,
        name: query.groups.name,
        type: query.groups.extension,
        url
      }
      return res
    })
    const folder = glob.sync(path.join(filePath, '*/')).map((result) => {
      const key = result.replace(path.join(appRootPath.path, 'packages', 'server', this.path), '')
      const name = key.replace(`${folderName}`, '').split('/')[0]
      const url = this.getSignedUrl(key, 3600, null).url
      const res: FileContentType = {
        key,
        name,
        type: 'folder',
        url
      }
      return res
    })
    files.push(...folder)
    return files
  }

  /**
   * @author Abhishek Pathak
   * @param current
   * @param destination
   * @param isCopy
   * @param renameTo
   * @returns
   */
  moveObject = async (current: string, destination: string, isCopy: boolean, renameTo: string): Promise<boolean> => {
    const contentpath = path.join(appRootPath.path, 'packages', 'server', this.path)
    let fileName = renameTo != null ? renameTo : path.basename(current)
    let fileCount = 1
    const file = fileName.split('.')
    current = path.join(contentpath, current)
    destination = path.join(contentpath, destination)
    while (fs.existsSync(path.join(destination, fileName))) {
      fileName = ''
      for (let i = 0; i < file.length - 1; i++) fileName += file[i]
      fileName = `${fileName}(${fileCount}).${file[file.length - 1]}`
      fileCount++
    }
    try {
      isCopy
        ? await fs.promises.copyFile(current, path.join(destination, fileName))
        : await fs.promises.rename(current, path.join(destination, fileName))
    } catch (err) {
      return false
    }
    return true
  }
}
export default LocalStorage
