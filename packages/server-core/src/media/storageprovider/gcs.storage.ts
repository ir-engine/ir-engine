/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { spawn } from 'child_process'
import path from 'path/posix'
import S3BlobStore from 's3-blob-store'

import { FileBrowserContentType } from '@ir-engine/common/src/schemas/media/file-browser.schema'

import config from '../../appconfig'
import {
  PutObjectParams,
  SignedURLResponse,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageObjectPutInterface,
  StorageProviderInterface
} from './storageprovider.interface'

import { UrlMapsClient } from '@google-cloud/compute'
import { NetworkServicesClient } from '@google-cloud/networkservices'
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'

import logger from '../../ServerLogger'
import { BaseStorageProvider } from './base.storage'

/**
 * Storage provide class to communicate with GCP Cloud Storage API.
 */
export class GCSStorage extends BaseStorageProvider implements StorageProviderInterface {
  constructor() {
    super()
  }
  /**
   * Name of GCS bucket.
   */
  bucket = config.gcp.gcs.bucket as string

  /**
   * Instance of GCS service object. This object has one method for each API operation.
   */
  provider = new Storage()

  getCacheDomain(internal?: boolean): string {
    return this.cacheDomain
  }

  /**
   * Domain address of GCS cache.
   */
  cacheDomain = config.gcp.gcs.cacheDomain! as string

  originURLs = [this.cacheDomain!]

  private bucketAssetURL = `https://storage.googleapis.com/download/storage/v1/b/${this.bucket}/o/`

  private urlMaps = new UrlMapsClient()

  private networkServicesClient = new NetworkServicesClient()

  /**
   * Get the instance of GCS storage provider.
   */
  getProvider(): StorageProviderInterface {
    return this
  }

  /**
   * Check if an object exists in the GCS storage.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    if (directoryPath[0] === '/') directoryPath = directoryPath.slice(1)
    const file = this.provider.bucket(this.bucket).file(path.join(directoryPath, fileName))
    const response = await file.exists()
    return response[0]
  }
  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    if (directoryPath[0] === '/') directoryPath = directoryPath.slice(1)
    const joinedPath = path.join(directoryPath, fileName, '/')
    const response = await this.provider.bucket(this.bucket).getFiles({
      prefix: joinedPath,
      maxResults: 1
    })

    const files = response[2] as {
      items?: { mediaLink: string; name: string; size: string }[]
      prefixes?: string[]
    }
    const item0 = files.items?.[0]
    // Directories in GCS don't exist and are emulated based on file path.
    return item0
      ? (item0.name === path.join(directoryPath, fileName, '/') && item0.size === '0') ||
          item0.name.indexOf(joinedPath) === 0
      : false
  }

  /**
   * Get the GCS storage object.
   * @param key Key of object.
   */
  async getObject(key: string): Promise<StorageObjectInterface> {
    const file = this.provider.bucket(this.bucket).file(key)
    const [metadata] = await file.getMetadata()
    const [fileBody] = await file.download()
    return { Body: fileBody, ContentType: metadata.contentType as string }
  }

  /**
   * Get the object from cache.
   * @param key Key of object.
   * @param internal Whether this is an internal call
   */
  getCachedURL(key: string, internal?: boolean): string {
    const cacheDomain = this.getCacheDomain(internal)
    return new URL(key, 'https://' + cacheDomain).href
  }

  /**
   * Get the content type of storage object.
   * @param key Key of object.
   */
  async getObjectContentType(key: string): Promise<any> {
    const file = this.provider.bucket(this.bucket).file(key)
    const [metadata] = await file.getMetadata()
    return metadata.contentType
  }

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well. Default is true.
   * @param continuationToken It indicates that the list is being continued with a token. Used for certain providers like GCS.
   * @param isDirectory
   * @returns {Promise<StorageListObjectInterface>}
   */
  async listObjects(
    prefix: string,
    recursive = true,
    continuationToken?: string,
    isDirectory?: boolean
  ): Promise<StorageListObjectInterface> {
    const files = await this.listFolderContent(prefix, recursive, isDirectory)
    return {
      Contents: files.map((file) => {
        return {
          Key: file.key!,
          Size: file.size!,
          Type: file.type!
        }
      })
    }
  }

  /**
   * Adds an object into the GCS storage.
   * @param data Storage object to be added.
   * @param params Parameters of the add request.
   */
  async putObject(data: StorageObjectPutInterface, params: PutObjectParams = {}): Promise<boolean> {
    if (!data.Key) return false
    // key should not contain '/' at the beginning
    let key = data.Key[0] === '/' ? data.Key.substring(1) : data.Key

    if (params.isDirectory) {
      data.Body = Buffer.alloc(0)
      data.ContentType = 'application/x-empty'
      key += '/'
    }

    const file = this.provider.bucket(this.bucket).file(key)

    const args: any = {
      contentType: data.ContentType
    }

    if (data.ContentEncoding) args.contentEncoding = data.ContentEncoding

    if (data.Metadata) args.metadata = data.Metadata

    try {
      await file.save(data.Body)
      await file.setMetadata(args)
      return true
    } catch (err) {
      console.log('Error with PutObject', err)
      return false
    }
  }

  async getOriginURLs(): Promise<string[]> {
    return ['']
  }

  /**
   * Invalidate items in Cloud CDN or Media CDN
   * @param invalidationItems List of keys.
   * @param useMediaCDN Not used for AWS, but part of createInvalidation parameter signature
   */
  async createInvalidation(invalidationItems: string[], useMediaCDN: boolean) {
    if (!invalidationItems || invalidationItems.length === 0) return
    invalidationItems = invalidationItems.map((item) => (item[0] !== '/' ? `/${item}` : item))
    if (useMediaCDN) {
      try {
        return Promise.all(
          invalidationItems.map((item) => {
            try {
              return new Promise((resolve) => {
                const initProcess = spawn('gcloud', [
                  'edge-cache',
                  'services',
                  'invalidate-cache',
                  config.gcp.gcs.edgeCacheService as string,
                  '--path',
                  item
                ])
                initProcess.once('exit', resolve)
                initProcess.once('error', resolve)
                initProcess.once('disconnect', resolve)
                // initProcess.stdout.on('data', (data) => console.log(data.toString()))
                initProcess.stderr.on('data', (data) => console.error(data.toString()))
              })
            } catch (err) {
              console.error('error invalidating', item, err)
            }
          })
        )
      } catch (err) {
        logger.error('Error invalidating Media CDN cache for %s', config.gcp.gcs.edgeCacheService)
        logger.error(err)
      }
    } else {
      // I attempted to replace this with a call to gcloud CLI to invalidate the cache, so as to not require
      // installing @google-cloud/compute, which takes up ~65 MB for just this one situation. But that required
      // installing the gcloud CLI in the client Dockerfiles, which takes a couple of minutes.
      // Overall, I think it's better to install the node_module. -Kyle
      return await this.urlMaps.invalidateCache({
        cacheInvalidationRuleResource: {
          host: config.server.clientHost as string,
          path: '/*'
        },
        project: config.gcp.project as string,
        urlMap: config.gcp.gcs.urlMap as string
      })
    }
  }

  associateWithFunction = async (): Promise<any> => Promise.resolve()

  createFunction = async (): Promise<any> => Promise.resolve()

  listFunctions = async (): Promise<any> => Promise.resolve()

  publishFunction = async (): Promise<any> => Promise.resolve()

  updateFunction = async (): Promise<any> => Promise.resolve()

  /**
   * Get the BlobStore object for GCS storage.
   */
  getStorage(): typeof S3BlobStore {
    return this.provider
  }

  /**
   * Get the form fields and target URL for direct POST uploading.
   * @param key Key of object.
   * @param expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour).
   * @param conditions An array of conditions that must be met for the form upload to be accepted by GCS.
   */
  async getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse> {
    // These options will allow temporary read access to the file
    const options = {
      version: 'v4',
      action: 'read',
      expires: expiresAfter
    } as GetSignedUrlConfig

    const [result] = await this.provider.bucket(this.bucket).file(key).getSignedUrl(options)

    return {
      fields: {},
      cacheDomain: this.cacheDomain,
      url: result,
      local: false
    }
  }

  /**
   * Delete resources in the GCS storage.
   * @param keys List of keys.
   */
  async deleteResources(keys: string[]) {
    const firstKeySplit = keys[0].split('/')
    const fileName = firstKeySplit[firstKeySplit.length - 1]
    const filePath = path.join(...firstKeySplit.slice(0, firstKeySplit.length - 1))
    //When deleting a folder, the first key passed in will be the folder path
    //Since GCS doesn't have folders, it can't be deleted via file.delete on the key
    //Instead, this will delete everything in the folder, which will also delete the folder itself.
    //Unsure how else to delete an empty folder
    if (await this.isDirectory(fileName, filePath))
      await this.provider.bucket(this.bucket).deleteFiles({ prefix: keys[0] + '/' })
    return await Promise.all(
      keys.map(async (key) => {
        return this.provider.bucket(this.bucket).file(key).delete({
          ignoreNotFound: true
        })
      })
    )
  }

  /**
   * List all the files/folders in the directory.
   * @param folderName Name of folder in the storage.
   * @param recursive If true it will list content from sub folders as well.
   * @param isDirectory
   */
  async listFolderContent(
    folderName: string,
    recursive = false,
    isDirectory = true
  ): Promise<FileBrowserContentType[]> {
    const prefix = folderName.endsWith('/') || !isDirectory ? folderName : folderName + '/'

    // Check if prefix is blacklisted
    this.checkBlacklistedPrefix(prefix)

    const response = await this.provider.bucket(this.bucket).getFiles({
      prefix,
      delimiter: recursive ? undefined : '/',
      includeFoldersAsPrefixes: !recursive
    })

    const promises: Promise<FileBrowserContentType>[] = []

    const files = response[2] as {
      items?: { mediaLink: string; name: string; size: string }[]
      prefixes?: string[]
    }
    if (!files.items) files.items = []
    if (!files.prefixes) files.prefixes = []

    if (!recursive) {
      // Folders
      for (let i = 0; i < files.prefixes!.length; i++) {
        promises.push(
          new Promise(async (resolve) => {
            const key = files.prefixes![i].slice(0, -1)
            const size = await this.getFolderSize(key)
            const cont: FileBrowserContentType = {
              key,
              url: `${this.bucketAssetURL}/${key}`,
              name: key.split('/').pop()!,
              type: 'folder',
              size
            }
            resolve(cont)
          })
        )
      }
    }

    if (recursive) {
      const folders = this.getUniqueFolderPathsFromFiles(files.items, prefix)
      for (let i = 0; i < folders.length; i++) {
        promises.push(
          new Promise(async (resolve) => {
            const key = folders[i].endsWith('/') ? folders[i].slice(0, -1) : folders[i]
            const size = await this.getFolderSize(key)
            const cont: FileBrowserContentType = {
              key,
              url: `${this.bucketAssetURL}/${key}`,
              name: key.split('/').pop()!,
              type: 'folder',
              size
            }
            resolve(cont)
          })
        )
      }
    }

    // Files
    for (let i = 0; i < files.items.length; i++) {
      const key = files.items[i].name
      const regexx = /(?:.*)\/(?<name>.*)\.(?<extension>.*)/g
      const query = regexx.exec(key)
      if (query) {
        promises.push(
          new Promise(async (resolve) => {
            const cont: FileBrowserContentType = {
              key,
              url: files.items![i].mediaLink as string,
              name: query!.groups!.name as string,
              type: query!.groups!.extension as string,
              size: parseInt(files.items![i].size)
            }
            resolve(cont)
          })
        )
      }
    }

    return await Promise.all(promises)
  }

  private getUniqueFolderPathsFromFiles(folderObjects: { name: string }[], prefix: string): string[] {
    prefix = prefix.startsWith('/') ? prefix.substring(1) : prefix

    if (!prefix.endsWith('/')) {
      prefix = prefix + '/'
    }

    const folders = new Set<string>()

    folderObjects.forEach((item) => {
      const key = item.name
      if (key.startsWith(prefix)) {
        const relativePath = key.substring(prefix.length)

        const parts = relativePath.split('/')
        let currentPath = prefix

        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += parts[i] + '/'
          folders.add(currentPath)
        }
      }
    })

    return Array.from(folders).sort()
  }

  async getFolderSize(folderName: string): Promise<number> {
    const folderContent = await this.listFolderContent(folderName)
    return folderContent.reduce((accumulator, { size }) => accumulator + size!, 0)
  }

  /**
   * Move or copy object from one place to another in the gcs storage.
   * @param oldName Name of the old object.
   * @param newName Name of the new object.
   * @param oldPath Path of the old object.
   * @param newPath Path of the new object.
   * @param isCopy If true it will create a copy of object.
   */
  async moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy = false) {
    const oldFilePath = path.join(oldPath, oldName)
    const newFilePath = path.join(newPath, newName)
    const listResponse = await this.listObjects(oldFilePath, false, undefined, false)

    if (listResponse.Contents.length > 0) {
      return await Promise.all([
        ...listResponse.Contents.map(async (file) => {
          const relativePath = file.Key.replace(oldFilePath, '')
          const key = newFilePath + relativePath

          if (file.Type === 'folder' && isCopy) {
            return await this.putObject({ Key: key } as StorageObjectInterface, {
              isDirectory: true
            })
          } else if (file.Type === 'folder' && !isCopy) {
            await this.putObject({ Key: key } as StorageObjectInterface, {
              isDirectory: true
            })
            return await this.deleteResources([file.Key])
          }

          if (isCopy) return await this.provider.bucket(this.bucket).file(file.Key).copy(key, {})
          else return await this.provider.bucket(this.bucket).file(file.Key).move(key, {})
        })
      ])
    }
  }
}

export default GCSStorage
