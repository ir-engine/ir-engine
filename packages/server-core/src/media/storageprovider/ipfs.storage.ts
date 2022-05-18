import * as k8s from '@kubernetes/client-node'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import * as net from 'net'
import path from 'path'
import stream, { Readable } from 'stream'
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
      url: `https://${this.cacheDomain}`,
      local: true,
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
  putObject(object: StorageObjectInterface, params?: PutObjectParams): Promise<any> {
    throw new Error('Method not implemented.')
  }
  deleteResources(keys: string[]): Promise<any> {
    throw new Error('Method not implemented.')
  }
  createInvalidation(invalidationItems: string[]): Promise<any> {
    throw new Error('Method not implemented.')
  }
  listFolderContent(folderName: string, recursive?: boolean): Promise<FileContentType[]> {
    throw new Error('Method not implemented.')
  }
  moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean): Promise<any> {
    throw new Error('Method not implemented.')
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
        `app=${appName}`
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
      Body: Readable.from(chunksArray),
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
