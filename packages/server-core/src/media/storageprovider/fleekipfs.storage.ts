import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'
import fleekStorage from '@fleekhq/fleek-storage-js'
import appRootPath from 'app-root-path'
import fs from 'fs'
import fsStore from 'fs-blob-store'
import glob from 'glob'
import path from 'path'
import config from '../../appconfig'
import {
  BlobStore,
  IPFSStorageListObjectInterface,
  IPFSStorageObjectInterface,
  IPFSStorageProviderInterface,
  SignedURLResponse
} from './ipfsstorageprovider.interface'

export class FleekIPFSProvider implements IPFSStorageProviderInterface {
  cacheDomain = config.ipfs.fleekKeys.storageDomain + '/' + config.ipfs.fleekKeys.bucket + '/'

  provider = {
    apiKey: config.ipfs.fleekKeys.apiKey,
    apiSecret: config.ipfs.fleekKeys.apiSecret,
    bucket: config.ipfs.fleekKeys.bucket
  }

  getProvider = (): IPFSStorageProviderInterface => this

  putObject(object: IPFSStorageObjectInterface): Promise<any> {
    return new Promise((resolve, reject) =>
      fleekStorage
        .upload({
          ...this.provider,
          key: object.Key!,
          data: object.Body,
          httpUploadProgressCallback: (event) => {}
        })
        .then((result) => {
          resolve(result)
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    )
  }

  getObject(key: string): Promise<IPFSStorageObjectInterface> {
    return new Promise((resolve, reject) => {
      fleekStorage
        .get({ ...this.provider, key })
        .then((result: any) => {
          resolve({
            Body: result.data as Buffer
          })
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  }

  deleteResource(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fleekStorage
        .deleteFile({ ...this.provider, key })
        .then((result: any) => {
          console.log('fleekStorage-upload deleteResource: ', result)
          resolve({
            result
          })
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  }
}

export default FleekIPFSProvider
