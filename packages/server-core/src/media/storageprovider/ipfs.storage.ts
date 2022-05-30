import * as k8s from '@kubernetes/client-node'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import * as net from 'net'
import path from 'path'
import * as stream from 'stream'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import config from '../../appconfig'
import {
  BlobStore,
  PutObjectParams,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'

export class IPFSStorage implements StorageProviderInterface {
  cacheDomain: string

  _client: IPFSHTTPClient
  _blobStore: IPFSBlobStore
  _pathPrefix: string = '/'
  _apiDomain: string

  doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    const filePath = path.join(this._pathPrefix, directoryPath, fileName)
    return this._client.files
      .stat(filePath)
      .then(() => true)
      .catch(() => false)
  }
  isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    const filePath = path.join(this._pathPrefix, directoryPath, fileName)
    return this._client.files
      .stat(filePath)
      .then((res) => res.type === 'directory')
      .catch(() => false)
  }
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
  getProvider(): StorageProviderInterface {
    return this
  }
  async getSignedUrl(key: string, _expiresAfter: number, _conditions: any): Promise<any> {
    const url = await this._getUrl(key)
    return {
      fields: { Key: key },
      url,
      local: false,
      cacheDomain: this.cacheDomain
    }
  }
  getStorage(): BlobStore {
    return this._blobStore
  }
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
  async deleteResources(keys: string[]): Promise<any> {
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
  createInvalidation = async (): Promise<any> => Promise.resolve()
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

  async _forwardIPFS(podName: string, forward: k8s.PortForward, forwardPort: number): Promise<string> {
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

  async _parseMFSDirectory(
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

  async _parseMFSDirectoryAsType(currentPath: string, results: FileContentType[]) {
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

  async _getUrl(assetPath: string): Promise<string> {
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

  _formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}

class IPFSBlobStore implements BlobStore {
  path: string = '/'
  cache: any

  _client: IPFSHTTPClient

  constructor(client: IPFSHTTPClient) {
    this._client = client
  }
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
