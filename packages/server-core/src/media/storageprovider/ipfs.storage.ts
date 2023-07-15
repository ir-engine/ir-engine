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

import * as k8s from '@kubernetes/client-node'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import * as net from 'net'
import path from 'path'
import * as stream from 'stream'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

import { FileContentType } from '@etherealengine/common/src/interfaces/FileContentType'

import config from '../../appconfig'
import {
  BlobStore,
  PutObjectParams,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'

/**
 * Storage provide class to communicate with InterPlanetary File System (IPFS) using Mutable File System (MFS).
 */
export class IPFSStorage implements StorageProviderInterface {
  private _client: IPFSHTTPClient
  private _blobStore: IPFSBlobStore
  private _pathPrefix: string = '/'
  private _apiDomain: string

  /**
   * Domain address of cache.
   */
  cacheDomain: string

  /**
   * Check if an object exists in the IPFS storage.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    const filePath = path.join(this._pathPrefix, directoryPath, fileName)
    return this._client.files
      .stat(filePath)
      .then(() => true)
      .catch(() => false)
  }

  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    const filePath = path.join(this._pathPrefix, directoryPath, fileName)
    return this._client.files
      .stat(filePath)
      .then((res) => res.type === 'directory')
      .catch(() => false)
  }

  /**
   * Get the IPFS storage object.
   * @param key Key of object.
   */
  async getObject(key: string): Promise<StorageObjectInterface> {
    const filePath = path.join(this._pathPrefix, key)
    const chunks: Uint8Array[] = []

    for await (const chunk of this._client.files.read(filePath)) {
      chunks.push(chunk)
    }

    const chunksArray = uint8ArrayConcat(chunks)

    // const decodedData = new TextDecoder().decode(chunksArray).toString();
    // console.log(decodedData)

    // const file=`https://ipfs.io/ipfs/${hash}`;
    // const req = await fetch(file, {method:'HEAD'})
    // console.log(req.headers.get('content-type'))

    return {
      Body: Buffer.from(chunksArray),
      ContentType: 'application/octet-stream'
    }
  }

  /**
   * Get the object from cache, otherwise returns getObject.
   * @param key Key of object.
   */
  async getCachedObject(key: string): Promise<StorageObjectInterface> {
    return this.getObject(key)
  }

  /**
   * Get the instance of IPFS storage provider.
   */
  getProvider(): StorageProviderInterface {
    return this
  }

  /**
   * Get the signed url response of the storage object.
   * @param key Key of object.
   * @param expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour).
   * @param conditions An array of conditions that must be met for certain providers. Not used in IPFS provider.
   */
  async getSignedUrl(key: string, _expiresAfter: number, _conditions: any) {
    const url = await this._getUrl(key)
    return {
      fields: { Key: key },
      url,
      local: false,
      cacheDomain: this.cacheDomain
    }
  }

  /**
   * Get the BlobStore object for IPFS storage.
   */
  getStorage(): BlobStore {
    return this._blobStore
  }

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well.
   * @param continuationToken It indicates that the list is being continued with a token. Not used in IPFS provider.
   */
  async listObjects(
    prefix: string,
    recursive?: boolean,
    continuationToken?: string
  ): Promise<StorageListObjectInterface> {
    const filePath = path.join(this._pathPrefix, prefix)

    const exists = await this.doesExist(filePath, '')
    if (!exists) return { Contents: [] }

    const results: {
      Key: string
    }[] = []

    if (recursive) {
      await this._parseMFSDirectory(filePath, results)
    } else {
      for await (const file of this._client.files.ls(filePath)) {
        const fullPath = path.join(filePath, file.name)
        results.push({ Key: fullPath })
      }
    }

    return {
      Contents: results
    }
  }

  /**
   * Adds an object into the IPFS storage.
   * @param object Storage object to be added.
   * @param params Parameters of the add request.
   */
  async putObject(object: StorageObjectInterface, params: PutObjectParams): Promise<boolean> {
    const filePath = path.join(this._pathPrefix, object.Key!)

    if (params.isDirectory) {
      if (!this.doesExist('', filePath)) {
        await this._client.files.mkdir(filePath, { parents: true })
        return true
      }
      return false
    }

    await this._client.files.write(filePath, object.Body, { parents: true, create: true })

    return true
  }

  /**
   * Delete resources in the IPFS storage.
   * @param keys List of keys.
   */
  async deleteResources(keys: string[]) {
    const status: boolean[] = []

    for (const key of keys) {
      try {
        const exists = await this.doesExist('', key)
        if (exists) {
          const filePath = path.join(this._pathPrefix, key)
          await this._client.files.rm(filePath, { recursive: true })
          status.push(true)
        } else {
          status.push(true)
        }
      } catch {
        status.push(false)
      }
    }

    return status
  }

  /**
   * Invalidate items in the IPFS storage.
   * @param invalidationItems List of keys.
   */
  async createInvalidation() {
    return Promise.resolve()
  }

  async associateWithFunction() {
    return Promise.resolve()
  }

  async createFunction() {
    return Promise.resolve()
  }

  async listFunctions() {
    return Promise.resolve()
  }

  async publishFunction() {
    return Promise.resolve()
  }

  async updateFunction() {
    return Promise.resolve()
  }

  /**
   * List all the files/folders in the directory.
   * @param folderName Name of folder in the storage.
   * @param recursive If true it will list content from sub folders as well.
   */
  async listFolderContent(folderName: string, recursive?: boolean): Promise<FileContentType[]> {
    const filePath = path.join(this._pathPrefix, folderName)

    const results: FileContentType[] = []

    if (recursive) {
      await this._parseMFSDirectoryAsType(filePath, results)
    } else {
      for await (const file of this._client.files.ls(filePath)) {
        const signedUrl = await this.getSignedUrl(file.cid.toString(), 3600, null)

        const res: FileContentType = {
          key: file.cid.toString(),
          name: file.name,
          type: file.type,
          url: signedUrl.url,
          size: this._formatBytes(file.size)
        }

        results.push(res)
      }
    }

    return results
  }

  /**
   * Move or copy object from one place to another in the IPFS storage.
   * @param oldName Name of the old object.
   * @param newName Name of the new object.
   * @param oldPath Path of the old object.
   * @param newPath Path of the new object.
   * @param isCopy If true it will create a copy of object.
   */
  async moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean): Promise<any> {
    const oldFilePath = path.join(this._pathPrefix, oldPath, oldName)
    const newFilePath = path.join(this._pathPrefix, newPath, newName)

    try {
      if (isCopy) {
        await this._client.files.cp(oldFilePath, newFilePath, { parents: true })
      } else {
        await this._client.files.mv(oldFilePath, newFilePath, { parents: true })
      }
    } catch (err) {
      return false
    }

    return true
  }

  /**
   * Initialize the IPFS storage. It port forwards the IPFS pod to expose its REST API for consumption.
   * @param podName Name of IPFS pod in cluster.
   */
  async initialize(podName: string): Promise<void> {
    if (config.kubernetes.enabled) {
      const kc = new k8s.KubeConfig()
      kc.loadFromDefault()

      const forward = new k8s.PortForward(kc)

      this.cacheDomain = await this._forwardIPFS(podName, forward, 8080)
      this._apiDomain = await this._forwardIPFS(podName, forward, 5001)
      this._client = create({ url: `http://${this._apiDomain}` })
      this._blobStore = new IPFSBlobStore(this._client)
    }
  }

  /**
   * Get the name of IPFS pod running in current cluster.
   */
  async getIPFSPod(): Promise<string> {
    if (config.kubernetes.enabled) {
      const kc = new k8s.KubeConfig()
      kc.loadFromDefault()

      const k8DefaultClient = kc.makeApiClient(k8s.CoreV1Api)

      const appName = `${config.server.releaseName}-ipfs`
      const podsResult = await k8DefaultClient.listNamespacedPod(
        'default',
        undefined,
        undefined,
        undefined,
        undefined,
        `app.kubernetes.io/instance==${appName}`
      )

      if (podsResult.body.items.length > 0) {
        return podsResult.body.items[0].metadata!.name!
      }
    }

    return ''
  }

  private async _forwardIPFS(podName: string, forward: k8s.PortForward, forwardPort: number): Promise<string> {
    return new Promise((resolve) => {
      const server = net.createServer((socket) => {
        forward.portForward('default', podName, [forwardPort], socket, socket, socket)
      })
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as net.AddressInfo
        const address = `127.0.0.1:${port}`
        console.log(`Listening IPFS port ${forwardPort} on: `, address)
        resolve(address)
      })
    })
  }

  private async _parseMFSDirectory(
    currentPath: string,
    results: {
      Key: string
    }[]
  ) {
    for await (const file of this._client.files.ls(currentPath)) {
      const fullPath = path.join(currentPath, file.name)
      results.push({ Key: fullPath })
      if (file.type === 'directory') {
        await this._parseMFSDirectory(fullPath, results)
      }
    }
  }

  private async _parseMFSDirectoryAsType(currentPath: string, results: FileContentType[]) {
    for await (const file of this._client.files.ls(currentPath)) {
      const res: FileContentType = {
        key: file.cid.toString(),
        name: path.join(currentPath, file.name),
        type: file.type,
        url: file.cid.toString(),
        size: this._formatBytes(file.size)
      }
      results.push(res)

      const fullPath = path.join(currentPath, file.name)
      if (file.type === 'directory') {
        await this._parseMFSDirectoryAsType(fullPath, results)
      }
    }
  }

  private async _getUrl(assetPath: string): Promise<string> {
    if (!this.cacheDomain) throw new Error('No cache domain found - please check the storage provider configuration')

    const filePath = path.join(this._pathPrefix, assetPath)

    return this._client.files
      .stat(filePath)
      .then(
        (stats) =>
          new URL(
            `/ipfs/${stats.cid.toString()}?filename=${encodeURI(path.basename(assetPath))}`,
            `http://${this.cacheDomain}`
          ).href
      )
      .catch(() => new URL(`http://${this.cacheDomain}`).href)
  }

  private _formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}

/**
 * Blob store class for IPFS storage.
 */
class IPFSBlobStore implements BlobStore {
  private _client: IPFSHTTPClient

  /**
   * Path for the IPFS blob store.
   */
  path: string = '/'
  /**
   * Cache for the IPFS blob store.
   */
  cache: any

  /**
   * Constructor of IPFSBlobStore class.
   * @param client Instance of IPFSHTTPClient object to communicate with IPFS instance.
   */
  constructor(client: IPFSHTTPClient) {
    this._client = client
  }

  /**
   * Creates a write stream for the IPFS blob store.
   * @param options Options for blob store.
   * @param cb Callback one the stream is ready.
   */
  createWriteStream(options: string | { key: string }, cb?: (err: any, result: any) => void) {
    if (typeof options === 'string') options = { key: options }
    if (options['name']) options.key = options['name']
    if (typeof options['flush'] === 'boolean' && options['flush'] === false) {
    } else {
      options['flush'] = true
    }
    const writePath = path.join(this.path, options.key)
    const bufferStream = new stream.PassThrough()

    let size = 0

    bufferStream.on('data', (buffer) => {
      size += buffer.length
    })

    this._client.files
      .write(writePath, bufferStream, {
        create: true,
        parents: true,
        flush: options['flush']
      })
      .then(() => {
        if (cb)
          cb(undefined, {
            key: options['key'],
            size: size,
            name: path.basename(writePath)
          })
      })
      .catch((error) => {
        if (cb) cb(error, undefined)
      })

    return bufferStream
  }

  /**
   * Creates a read stream for the IPFS blob store.
   * @param key Key of object.
   * @param options Options for blob store.
   */
  async createReadStream(key: string | { key: string }, options?: any) {
    if (typeof options === 'string') options = { key: options }
    if (options.name) options.key = options.name

    const readPath = path.join(this.path, options.key)

    const chunks: Uint8Array[] = []

    for await (const chunk of this._client.files.read(readPath)) {
      chunks.push(chunk)
    }

    const chunksArray = uint8ArrayConcat(chunks)

    return {
      Body: stream.Readable.from(chunksArray),
      ContentType: 'application/octet-stream'
    }
  }

  /**
   * Checks whether an object exists in the IPFS blob store.
   * @param options Options for blob store.
   * @param cb Callback one the stream is ready.
   */
  exists(options: string | { key: string }, cb?: (err: any, result: any) => void) {
    if (typeof options === 'string') options = { key: options }
    if (options['name']) options.key = options['name']

    const statPath = path.join(this.path, options.key)

    this._client.files
      .stat(statPath)
      .then(() => {
        if (cb) cb(undefined, true)
        return true
      })
      .catch(() => {
        if (cb) cb(true, undefined)
        return false
      })
  }

  /**
   * Removes an object from the IPFS blob store.
   * @param options Options for blob store.
   * @param cb Callback one the stream is ready.
   */
  remove(options: string | { key: string }, cb?: (err: any, result: any) => void) {
    if (typeof options === 'string') options = { key: options }
    if (options['name']) options.key = options['name']

    const rmPath = path.join(this.path, options.key)

    this._client.files
      .rm(rmPath)
      .then(() => {
        if (cb) cb(undefined, true)
        return true
      })
      .catch(() => {
        if (cb) cb(true, undefined)
        return false
      })
  }
}

export default IPFSStorage
