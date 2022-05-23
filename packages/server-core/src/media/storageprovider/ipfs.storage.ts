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

  doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    return this._client.files
      .stat(path.join(directoryPath, fileName))
      .then(() => true)
      .catch(() => false)
  }
  isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    return this._client.files
      .stat(path.join(directoryPath, fileName))
      .then((res) => res.type === 'directory')
      .catch(() => false)
  }
  async getObject(key: string): Promise<StorageObjectInterface> {
    const chunks: Uint8Array[] = []

    for await (const chunk of this._client.files.read(key)) {
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
  getSignedUrl(key: string, _expiresAfter: number, _conditions: any): any {
    return {
      fields: { Key: key },
      url: `https://ipfs.io/ipfs/${key}`,
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
    const exists = await this.doesExist(prefix, '')
    if (!exists) return { Contents: [] }

    const results: {
      Key: string
    }[] = []

    if (recursive) {
      await this._parseMFSDirectory(prefix, results)
    } else {
      for await (const file of this._client.files.ls(prefix)) {
        const fullPath = path.join(prefix, file.name)
        results.push({ Key: fullPath })
      }
    }

    return {
      Contents: results
    }
  }
  async putObject(object: StorageObjectInterface, params: PutObjectParams): Promise<boolean> {
    const filePath = object.Key!

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
          await this._client.files.rm(key, { recursive: true })
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
    const results: FileContentType[] = []

    if (recursive) {
      await this._parseMFSDirectoryAsType(folderName, results)
    } else {
      for await (const file of this._client.files.ls(folderName)) {
        const res: FileContentType = {
          key: file.cid.toString(),
          name: file.name,
          type: file.type,
          url: this.getSignedUrl(file.cid.toString(), 3600, null).url,
          size: this._formatBytes(file.size)
        }

        results.push(res)
      }
    }

    return results
  }
  async moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean): Promise<any> {
    const oldFilePath = path.join(oldPath, oldName)
    const newFilePath = path.join(newPath, newName)

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

      this.cacheDomain = await this._forwardIPFS(podName, forward)
      this._client = create({ url: this.cacheDomain })
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

  async _forwardIPFS(podName: string, forward: k8s.PortForward): Promise<string> {
    return new Promise((resolve) => {
      const server = net.createServer((socket) => {
        forward.portForward('default', podName, [5001], socket, socket, socket)
      })
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as net.AddressInfo
        const address = `http://127.0.0.1:${port}`
        console.log('Listening IPFS on: ', address)
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
