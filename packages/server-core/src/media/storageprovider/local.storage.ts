import appRootPath from 'app-root-path'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path/posix'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import config from '../../appconfig'
import logger from '../../logger'
import { getContentType } from '../../util/fileUtils'
import { copyRecursiveSync } from '../FileUtil'
import {
  BlobStore,
  PutObjectParams,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'

export class LocalStorage implements StorageProviderInterface {
  STORAGE_DIR = 'server/upload'
  PATH_PREFIX: string

  cacheDomain = config.server.localStorageProvider
  _store: typeof fsStore

  constructor() {
    this.PATH_PREFIX = path.join(appRootPath.path.replaceAll('\\', path.sep), 'packages', this.STORAGE_DIR)

    // make upload folder if it doesnt already exist
    if (!fs.existsSync(this.PATH_PREFIX)) fs.mkdirSync(this.PATH_PREFIX)

    // Add '/' to end to simplify many operations
    this.PATH_PREFIX += path.sep
    this._store = fsStore(this.PATH_PREFIX)
  }

  getObject = async (key: string): Promise<StorageObjectInterface> => {
    const filePath = path.join(this.PATH_PREFIX, key)
    const result = await fs.promises.readFile(filePath)
    return {
      Body: result,
      ContentType: getContentType(filePath)
    }
  }

  listObjects = async (
    prefix: string,
    recursive = false,
    continuationToken: string
  ): Promise<StorageListObjectInterface> => {
    const filePath = path.join(this.PATH_PREFIX, prefix)
    if (!fs.existsSync(filePath)) return { Contents: [] }
    const globResult = glob.sync(path.join(filePath, '**/*.*'))
    return {
      Contents: globResult.map((result) => {
        return { Key: result.replace(path.join(this.PATH_PREFIX), '') }
      })
    }
  }

  putObject = async (data: StorageObjectInterface, params: PutObjectParams = {}): Promise<any> => {
    const filePath = path.join(this.PATH_PREFIX, data.Key!)

    if (params.isDirectory) {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true })
        return true
      }
      return false
    }

    const pathWithoutFile = path.dirname(filePath)
    if (pathWithoutFile == null) throw new Error('Invalid file path in local putObject')
    if (!fs.existsSync(pathWithoutFile)) fs.mkdirSync(pathWithoutFile, { recursive: true })

    fs.writeFileSync(filePath, data.Body)

    return true
  }

  createInvalidation = async (): Promise<any> => Promise.resolve()

  getProvider = (): StorageProviderInterface => this
  getStorage = (): BlobStore => this._store

  doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    return fs.promises
      .access(path.join(this.PATH_PREFIX, directoryPath, fileName))
      .then(() => true)
      .catch(() => false)
  }

  isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    return fs.promises
      .lstat(path.join(this.PATH_PREFIX, directoryPath, fileName))
      .then((res) => res.isDirectory())
      .catch(() => false)
  }

  getSignedUrl = (key: string, _expiresAfter: number, _conditions): any => {
    return {
      fields: { Key: key },
      url: `https://${this.cacheDomain}`,
      local: true,
      cacheDomain: this.cacheDomain
    }
  }

  deleteResources(keys: string[]) {
    const blobs = this.getStorage()

    return Promise.all<boolean>(
      keys.map((key) => {
        return new Promise<boolean>((resolve) => {
          blobs.exists(key, (err, exists) => {
            if (err) {
              logger.error(err)
              resolve(false)
              return
            }
            if (exists) {
              blobs.remove(key, (err) => {
                if (err) {
                  const filePath = path.join(this.PATH_PREFIX, key)
                  if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { force: true, recursive: true })
                    resolve(true)
                  } else {
                    resolve(false)
                    logger.error(err)
                    return
                  }
                }
                resolve(true)
              })
            } else {
              resolve(true)
            }
          })
        })
      })
    )
  }

  formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  processContent = (dirPath: string, pathString: string, isDir = false): FileContentType => {
    const res = { key: pathString.replace(this.PATH_PREFIX, '') } as FileContentType
    const signedUrl = this.getSignedUrl(res.key, 3600, null)

    if (isDir) {
      const filePaths = glob.sync('**', {
        // "**" means you search on the whole folder
        cwd: pathString, // folder path
        absolute: true // you have to set glob to return absolute path not only file names
      })
      let totalSize = 0
      filePaths.forEach((file) => {
        const stat = fs.lstatSync(file)
        totalSize += stat.size
      })
      res.name = res.key.replace(`${dirPath}`, '').split(path.sep)[0]
      res.type = 'folder'
      res.url = this.getSignedUrl(res.key, 3600, null).url
      res.size = this.formatBytes(totalSize)
    } else {
      res.type = path.extname(res.key).substring(1) // remove '.' from extension
      res.name = path.basename(res.key, '.' + res.type)
      res.size = this.formatBytes(fs.lstatSync(pathString).size)
      res.url = signedUrl.url + path.sep + signedUrl.fields.Key
    }

    return res
  }

  /**
   * @author Abhishek Pathak
   * @param relativeDirPath
   * @returns
   */
  listFolderContent = async (relativeDirPath: string): Promise<FileContentType[]> => {
    const absoluteDirPath = path.join(this.PATH_PREFIX, relativeDirPath)

    const folder = glob.sync(path.join(absoluteDirPath, '*/')).map((p) => this.processContent(relativeDirPath, p, true))
    const files = glob.sync(path.join(absoluteDirPath, '*.*')).map((p) => this.processContent(relativeDirPath, p))

    folder.push(...files)
    return folder
  }

  /**
   * @author Nayankumar Patel
   * @param oldName
   * @param oldPath
   * @param newName
   * @param newPath
   * @param isCopy
   * @returns
   */
  moveObject = async (
    oldName: string,
    newName: string,
    oldPath: string,
    newPath: string,
    isCopy = false
  ): Promise<boolean> => {
    const oldFilePath = path.join(this.PATH_PREFIX, oldPath, oldName)
    const newFilePath = path.join(this.PATH_PREFIX, newPath, newName)

    try {
      isCopy ? copyRecursiveSync(oldFilePath, newFilePath) : fs.renameSync(oldFilePath, newFilePath)
    } catch (err) {
      return false
    }

    return true
  }
}
export default LocalStorage
