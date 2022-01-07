import appRootPath from 'app-root-path'
import config from '../../appconfig'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path/posix'
import {
  BlobStore,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'
import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'
import { getContentType } from '../../util/fileUtils'

export class LocalStorage implements StorageProviderInterface {
  STORAGE_DIR = 'server/upload'
  PATH_PREFIX: string

  cacheDomain = config.server.localStorageProvider
  _store: fsStore

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

  deleteResources(keys: string[]) {
    //Currently Not able to delete dir
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
                  console.error(err)
                  resolve(false)
                  return
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

  processContent = (dirPath: string, pathString: string, isDir = false): FileContentType => {
    const res = { key: pathString.replace(this.PATH_PREFIX, '') } as FileContentType
    const signedUrl = this.getSignedUrl(res.key, 3600, null)

    if (isDir) {
      res.name = res.key.replace(`${dirPath}`, '').split(path.sep)[0]
      res.type = 'folder'
      res.url = this.getSignedUrl(res.key, 3600, null).url
    } else {
      // const regex = /(?:.*)\/(?<name>.*)\.(?<extension>.*)/g
      // const query = regex.exec(res.key)

      res.type = path.extname(res.key).substring(1) // remove '.' from extension
      res.name = path.basename(res.key, '.' + res.type)

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
