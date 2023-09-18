/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path/posix'
import { PassThrough, Readable } from 'stream'

import { MULTIPART_CUTOFF_SIZE } from '@etherealengine/common/src/constants/FileSizeConstants'

import { FileBrowserContentType } from '@etherealengine/engine/src/schemas/media/file-browser.schema'
import { getState } from '@etherealengine/hyperflux'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import config from '../../appconfig'
import { getContentType } from '../../util/fileUtils'
import { copyRecursiveSync } from '../FileUtil'
import {
  BlobStore,
  PutObjectParams,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageObjectPutInterface,
  StorageProviderInterface
} from './storageprovider.interface'

/**
 * Storage provide class to communicate with Local http file server.
 */
export class LocalStorage implements StorageProviderInterface {
  private _storageDir = config.testEnabled ? 'server/upload_test' : 'server/upload'
  private _store: typeof fsStore

  /**
   * Path prefix for local storage. This is the physical path on local drive where file resides.
   */
  PATH_PREFIX: string

  /**
   * Domain address of local storage cache.
   */
  cacheDomain = config.server.localStorageProvider

  originURLs = [this.cacheDomain]

  /**
   * Constructor of LocalStorage class.
   */
  constructor() {
    this.PATH_PREFIX = path.join(appRootPath.path.replaceAll('\\', path.sep), 'packages', this._storageDir)

    // make upload folder if it doesn't already exist
    if (!fs.existsSync(this.PATH_PREFIX)) fs.mkdirSync(this.PATH_PREFIX)

    // Add '/' to end to simplify many operations
    this.PATH_PREFIX += path.sep
    this._store = fsStore(this.PATH_PREFIX)

    if (getState(ServerState).serverMode === ServerMode.API && !config.testEnabled) {
      require('child_process').spawn('npm', ['run', 'serve-local-files'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
    }
    this.getOriginURLs().then((result) => (this.originURLs = result))
  }

  /**
   * Get the local storage object.
   * @param key Key of object.
   */
  getObject = async (key: string): Promise<StorageObjectInterface> => {
    const filePath = path.join(this.PATH_PREFIX, key)
    const result = await fs.promises.readFile(filePath)
    return {
      Body: result,
      ContentType: getContentType(filePath)
    }
  }

  /**
   * Get the object from cache, otherwise returns getObject.
   * @param key Key of object.
   */
  getCachedObject = async (key: string): Promise<StorageObjectInterface> => {
    return this.getObject(key)
  }

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well. Not used in local storage provider.
   * @param continuationToken It indicates that the list is being continued with a token. Not used in local storage provider.
   */
  listObjects = async (
    prefix: string,
    recursive = false,
    continuationToken: string
  ): Promise<StorageListObjectInterface> => {
    const filePath = path.join(this.PATH_PREFIX, prefix)
    if (!fs.existsSync(filePath)) return { Contents: [] }
    // glob all files and directories
    let globResult = glob.sync(path.join(filePath, '**'), {
      dot: true
    })
    globResult = globResult.filter(
      (item) =>
        /[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/.test(item) ||
        /.gitignore/.test(item) ||
        /.gitattributes/.test(item) ||
        /.git\/workflows/.test(item)
    )
    return {
      Contents: globResult.map((result) => {
        return {
          Key: result.replace(path.join(this.PATH_PREFIX), ''),
          Size: fs.lstatSync(path.join(this.PATH_PREFIX)).size
        }
      })
    }
  }

  /**
   * Adds an object into the local storage.
   * @param data Storage object to be added.
   * @param params Parameters of the add request.
   */
  putObject = async (data: StorageObjectPutInterface, params: PutObjectParams = {}): Promise<any> => {
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

    if (data.Body instanceof PassThrough) {
      return new Promise<boolean>((resolve, reject) => {
        try {
          const writeableStream = fs.createWriteStream(filePath)
          const passthrough = data.Body as PassThrough
          passthrough.pipe(writeableStream)
          passthrough.on('end', () => {
            logger.info('File uploaded successfully to ' + filePath)
            resolve(true)
          })
          passthrough.on('error', (e) => {
            logger.error(e)
            reject(e)
          })
        } catch (e) {
          logger.error(e)
          reject(e)
        }
      })
    } else if (data.Body?.length > MULTIPART_CUTOFF_SIZE) {
      return new Promise<boolean>((resolve, reject) => {
        try {
          const writeableStream = fs.createWriteStream(filePath)
          const readable = Readable.from(data.Body)
          readable.pipe(writeableStream)
          writeableStream.on('finish', () => {
            console.log('finished writing to file', filePath)
            resolve(true)
          })
          readable.on('error', (e) => {
            logger.error(e)
            reject(e)
          })
        } catch (e) {
          logger.error(e)
          reject(e)
        }
      })
    } else {
      fs.writeFileSync(filePath, data.Body)
      return true
    }
  }

  /**
   * Invalidate items in the local storage.
   * @param invalidationItems List of keys.
   */
  createInvalidation = async (): Promise<any> => Promise.resolve()

  async getOriginURLs(): Promise<string[]> {
    return [this.cacheDomain]
  }

  associateWithFunction = async (): Promise<any> => Promise.resolve()

  createFunction = async (): Promise<any> => Promise.resolve()

  listFunctions = async (): Promise<any> => Promise.resolve()

  publishFunction = async (): Promise<any> => Promise.resolve()

  updateFunction = async (): Promise<any> => Promise.resolve()

  /**
   * Get the instance of local storage provider.
   */
  getProvider = (): StorageProviderInterface => this

  /**
   * Get the BlobStore object for local storage.
   */
  getStorage = (): BlobStore => this._store

  /**
   * Check if an object exists in the local storage.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    return fs.promises
      .access(path.join(this.PATH_PREFIX, directoryPath, fileName))
      .then(() => true)
      .catch(() => false)
  }

  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    return fs.promises
      .lstat(path.join(this.PATH_PREFIX, directoryPath, fileName))
      .then((res) => res.isDirectory())
      .catch(() => false)
  }

  /**
   * Get the signed url response of the storage object.
   * @param key Key of object.
   * @param _expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour). Not used in local provider.
   * @param _conditions An array of conditions that must be met for certain providers. Not used in local provider.
   */
  getSignedUrl = (key: string, _expiresAfter: number, _conditions): any => {
    return {
      fields: { key },
      url: `https://${this.cacheDomain}`,
      local: true,
      cacheDomain: this.cacheDomain
    }
  }

  /**
   * Delete resources in the local storage.
   * @param keys List of keys.
   */
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
                  if (!fs.existsSync(filePath)) {
                    resolve(true)
                  } else if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { force: true, recursive: true })
                    resolve(true)
                  } else {
                    resolve(false)
                    logger.error(err)
                  }
                } else {
                  resolve(true)
                }
              })
            } else {
              resolve(true)
            }
          })
        })
      })
    )
  }

  private _processContent = (dirPath: string, pathString: string, isDir = false): FileBrowserContentType => {
    const res = { key: pathString.replace(this.PATH_PREFIX, '') } as FileBrowserContentType
    const signedUrl = this.getSignedUrl(res.key, 3600, null)

    if (isDir) {
      const filePaths = glob.sync('**', {
        // "**" means you search on the whole folder
        cwd: pathString, // folder path
        absolute: true, // you have to set glob to return absolute path not only file names
        dot: true
      })
      let totalSize = 0
      filePaths.forEach((file) => {
        const stat = fs.lstatSync(file)
        totalSize += stat.size
      })
      res.name = res.key.replace(`${dirPath}`, '').split(path.sep)[0]
      res.type = 'folder'
      res.url = this.getSignedUrl(res.key, 3600, null).url
      res.size = totalSize
    } else {
      res.type = path.extname(res.key).substring(1) // remove '.' from extension
      res.name = path.basename(res.key, '.' + res.type)
      res.size = fs.lstatSync(pathString).size
      res.url = signedUrl.url + path.sep + signedUrl.fields.Key
    }

    return res
  }

  /**
   * List all the files/folders in the directory.
   * @param relativeDirPath Name of folder in the storage.
   */
  listFolderContent = async (relativeDirPath: string): Promise<FileBrowserContentType[]> => {
    const absoluteDirPath = path.join(this.PATH_PREFIX, relativeDirPath)

    const folder = glob
      .sync(path.join(absoluteDirPath, '*/'))
      .map((p) => this._processContent(relativeDirPath, p, true))
    const files = glob
      .sync(path.join(absoluteDirPath, '*.*'), {
        dot: true
      })
      .map((p) => this._processContent(relativeDirPath, p))

    folder.push(...files)
    return folder
  }

  /**
   * Move or copy object from one place to another in the local storage.
   * @param oldName Name of the old object.
   * @param newName Name of the new object.
   * @param oldPath Path of the old object.
   * @param newPath Path of the new object.
   * @param isCopy If true it will create a copy of object.
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

    if (!fs.existsSync(path.dirname(newFilePath))) fs.mkdirSync(path.dirname(newFilePath), { recursive: true })

    try {
      isCopy ? copyRecursiveSync(oldFilePath, newFilePath) : fs.renameSync(oldFilePath, newFilePath)
    } catch (err) {
      return false
    }

    return true
  }
}

export default LocalStorage
