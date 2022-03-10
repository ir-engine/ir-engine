import appRootPath from 'app-root-path'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path/posix'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import config from '../../appconfig'
import { getContentType } from '../../util/fileUtils'
import {
  BlobStore,
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
    results: any[],
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

  putObject = async (params: StorageObjectInterface): Promise<any> => {
    const filePath = path.join(this.PATH_PREFIX, params.Key!)
    const pathWithoutFile = path.dirname(filePath)
    if (filePath.substr(-1) === '/') {
      if (!fs.existsSync(filePath)) {
        await fs.promises.mkdir(filePath, { recursive: true })
        return true
      }
      return false
    }
    if (pathWithoutFile == null) throw new Error('Invalid file path in local putObject')
    const pathWithoutFileExists = fs.existsSync(pathWithoutFile)
    if (!pathWithoutFileExists) await fs.promises.mkdir(pathWithoutFile, { recursive: true })
    return fs.promises.writeFile(filePath, params.Body)
  }

  createInvalidation = async (): Promise<any> => Promise.resolve()

  getProvider = (): StorageProviderInterface => this
  getStorage = (): BlobStore => this._store

  checkObjectExistence = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const filePath = path.join(this.PATH_PREFIX, key)
      const exists = fs.existsSync(filePath)
      if (exists) reject(new Error('Object already exists'))
      else resolve(null)
    })
  }

  getSignedUrl = (key: string, _expiresAfter: number, _conditions): any => {
    return {
      fields: { Key: key },
      url: `https://${this.cacheDomain}`,
      local: true,
      cacheDomain: this.cacheDomain
    }
  }

  removeDir(path: string) {
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path)
      if (files.length > 0) {
        files.forEach((filename) => {
          if (fs.statSync(path + filename).isDirectory()) {
            this.removeDir(path + filename)
          } else {
            fs.unlinkSync(path + filename)
          }
        })
        fs.rmdirSync(path)
      } else {
        fs.rmdirSync(path)
      }
    }
  }

  deleteResources(keys: string[]) {
    const blobs = this.getStorage()

    return Promise.all<boolean>(
      keys.map((key) => {
        return new Promise<boolean>((resolve) => {
          blobs.exists(key, (err, exists) => {
            if (err) {
              console.error(err)
              resolve(false)
              return
            }
            if (exists) {
              blobs.remove(key, (err) => {
                if (err) {
                  const filePath = path.join(this.PATH_PREFIX, key)
                  if (fs.statSync(filePath).isDirectory()) {
                    this.removeDir(filePath)
                    resolve(true)
                  } else {
                    resolve(false)
                    console.error(err)
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
        const stat = fs.statSync(file)
        totalSize += stat.size
      })
      res.name = res.key.replace(`${dirPath}`, '').split(path.sep)[0]
      res.type = 'folder'
      res.url = this.getSignedUrl(res.key, 3600, null).url
      res.size = this.formatBytes(totalSize)
    } else {
      // const regex = /(?:.*)\/(?<name>.*)\.(?<extension>.*)/g
      // const query = regex.exec(res.key)

      res.type = path.extname(res.key).substring(1) // remove '.' from extension
      res.name = path.basename(res.key, '.' + res.type)
      res.size = this.formatBytes(fs.statSync(pathString).size)
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
   * @author Abhishek Pathak
   * @param current
   * @param destination
   * @param isCopy
   * @param renameTo
   * @returns
   */
  moveObject = async (
    current: string,
    destination: string,
    isCopy = false,
    renameTo: string = null!
  ): Promise<boolean> => {
    const contentpath = path.join(this.PATH_PREFIX)
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
