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
import { FileBrowserContentType } from '@xrengine/engine/src/common/types/FileBrowserContentType'

const keyPathRegex = /([a-zA-Z0-9/_-]+)\/[a-zA-Z0-9]+.[a-zA-Z0-9]+/

export class LocalStorage implements StorageProviderInterface {
  path = './upload'
  cacheDomain = config.server.localStorageProvider

  getObject = async (key: string): Promise<any> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, key)
    const result = await fs.promises.readFile(filePath)
    return { Body: result }
  }

  listObjects = async (prefix: string, pattern?: string): Promise<StorageListObjectInterface> => {
    const filePath = path.join(appRootPath.path, 'packages', 'server', this.path, prefix)
    if (!fs.existsSync(filePath)) await fs.promises.mkdir(filePath, { recursive: true })
    const globResult = glob.sync(path.join(filePath, pattern || '**/*.*'))
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
      url: `https://${this.cacheDomain}`,
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
   * @param dir
   * @returns
   */
  createDirectory = async (dir: string) => {
    const folderPath = path.join(appRootPath.path, 'packages', 'server', this.path, dir)
    try {
      await fs.promises.mkdir(path.join(folderPath))
    } catch {
      return false
    }
    return true
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
      const regexx = /(?<name>[0-9 a-z A-Z]*)\.((?<extension>[0-9 a-z A-Z]*))/g
      const query = regexx.exec(key)
      const res: FileBrowserContentType = {
        key,
        name: query.groups.name,
        type: query.groups.extension
      }
      return res
    })
    const folder = glob.sync(path.join(filePath, '*/')).map((result) => {
      const key = result.replace(path.join(appRootPath.path, 'packages', 'server', this.path), '')
      const name = key.replace(`${folderName}`, '').split('/')[0]
      const res: FileBrowserContentType = {
        key,
        name,
        type: 'folder'
      }
      return res
    })
    files.push(...folder)
    return files
  }

  move = () => {
    console.log('Moving the Project Files')
  }
}
export default LocalStorage
