import AWS from 'aws-sdk'
import { ObjectIdentifierList, PresignedPost } from 'aws-sdk/clients/s3'
import fetch from 'node-fetch'
import path from 'path/posix'
import S3BlobStore from 's3-blob-store'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import config from '../../appconfig'
import { getCachedURL } from './getCachedURL'
import {
  PutObjectParams,
  SignedURLResponse,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'

/**
 * Storage provide class to communicate with AWS S3 API.
 */
export class S3Provider implements StorageProviderInterface {
  /**
   * Name of S3 bucket.
   */
  bucket = config.aws.s3.staticResourceBucket

  /**
   * Instance of S3 service object. This object has one method for each API operation.
   */
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey,
    endpoint: config.aws.s3.endpoint,
    region: config.aws.s3.region,
    s3ForcePathStyle: true,
    maxRetries: 1
  })

  /**
   * Domain address of S3 cache.
   */
  cacheDomain =
    config.server.storageProvider === 'aws'
      ? config.aws.cloudfront.domain
      : `${config.aws.cloudfront.domain}/${this.bucket}`

  private bucketAssetURL =
    config.server.storageProvider === 'aws'
      ? `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com`
      : `https://${config.aws.cloudfront.domain}/${this.bucket}`

  private blob: typeof S3BlobStore = new S3BlobStore({
    client: this.provider,
    bucket: config.aws.s3.staticResourceBucket,
    ACL: 'public-read'
  })

  private cloudfront: AWS.CloudFront = new AWS.CloudFront({
    region: config.aws.s3.region,
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey
  })

  /**
   * Get the instance of S3 storage provider.
   */
  getProvider(): StorageProviderInterface {
    return this
  }

  /**
   * Check if an object exists in the S3 storage.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async doesExist(fileName: string, directoryPath: string): Promise<boolean> {
    // have to use listOBjectsV2 since other object related methods does not check existance of a folder on S3
    const result = await this.provider
      .listObjectsV2({
        Bucket: this.bucket,
        Prefix: path.join(directoryPath, fileName),
        MaxKeys: 1
      })
      .promise()
      .then((res) => (res.Contents && res.Contents.length > 0) || false)
      .catch(() => false)

    return result
  }

  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    // last character of the key of directory is '/'
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.htmlhow to
    const result = await this.provider
      .listObjectsV2({
        Bucket: this.bucket,
        Prefix: path.join(directoryPath, fileName),
        MaxKeys: 1
      })
      .promise()
      .then((res) => res?.Contents?.[0]?.Key?.endsWith('/') || false)
      .catch(() => false)

    return result
  }

  /**
   * Get the S3 storage object.
   * @param key Key of object.
   */
  async getObject(key: string): Promise<StorageObjectInterface> {
    const data = await this.provider.getObject({ Bucket: this.bucket, Key: key }).promise()
    return { Body: data.Body as Buffer, ContentType: data.ContentType! }
  }

  /**
   * Get the object from cache.
   * @param key Key of object.
   */
  async getCachedObject(key: string): Promise<StorageObjectInterface> {
    const data = await fetch(getCachedURL(key, this.cacheDomain))
    return { Body: Buffer.from(await data.arrayBuffer()), ContentType: (await data.headers.get('content-type')) || '' }
  }

  /**
   * Get the content type of storage object.
   * @param key Key of object.
   */
  async getObjectContentType(key: string): Promise<any> {
    const data = await this.provider.headObject({ Bucket: this.bucket, Key: key }).promise()
    return data.ContentType
  }

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well. Default is true.
   * @param continuationToken It indicates that the list is being continued with a token. Used for certain providers like S3.
   * @returns {Promise<StorageListObjectInterface>}
   */
  async listObjects(prefix: string, recursive = true, continuationToken?: string): Promise<StorageListObjectInterface> {
    const data = await this.provider
      .listObjectsV2({
        Bucket: this.bucket,
        ContinuationToken: continuationToken,
        Prefix: prefix,
        Delimiter: recursive ? undefined : '/'
      })
      .promise()

    if (!data.Contents) data.Contents = []
    if (!data.CommonPrefixes) data.CommonPrefixes = []

    if (data.IsTruncated) {
      const _data = await this.listObjects(prefix, recursive, data.NextContinuationToken)
      data.Contents = data.Contents.concat(_data.Contents)
      if (_data.CommonPrefixes) data.CommonPrefixes = data.CommonPrefixes.concat(_data.CommonPrefixes)
    }

    return data as StorageListObjectInterface
  }

  /**
   * Adds an object into the S3 storage.
   * @param object Storage object to be added.
   * @param params Parameters of the add request.
   */
  async putObject(data: StorageObjectInterface, params: PutObjectParams = {}): Promise<any> {
    if (!data.Key) return

    // key should not contain '/' at the begining
    let key = data.Key[0] === '/' ? data.Key.substring(1) : data.Key

    const args = params.isDirectory
      ? {
          ACL: 'public-read',
          Body: Buffer.alloc(0),
          Bucket: this.bucket,
          ContentType: 'application/x-empty',
          Key: key + '/'
        }
      : {
          ACL: 'public-read',
          Body: data.Body,
          Bucket: this.bucket,
          ContentType: data.ContentType,
          Key: key
        }

    const result = await this.provider.putObject(args).promise()

    return result
  }

  /**
   * Invalidate items in the S3 storage.
   * @param invalidationItems List of keys.
   */
  async createInvalidation(invalidationItems: any[]) {
    // for non-standard s3 setups, we don't use cloudfront
    if (config.server.storageProvider !== 'aws') return
    const data = await this.cloudfront
      .createInvalidation({
        DistributionId: config.aws.cloudfront.distributionId,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: invalidationItems.length,
            Items: invalidationItems.map((item) => (item[0] !== '/' ? `/${item}` : item))
          }
        }
      })
      .promise()

    return data
  }

  /**
   * Get the BlobStore object for S3 storage.
   */
  getStorage(): typeof S3BlobStore {
    this.blob
  }

  /**
   * Get the form fields and target URL for direct POST uploading.
   * @param key Key of object.
   * @param expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour).
   * @param conditions An array of conditions that must be met for the form upload to be accepted by S3..
   */
  async getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse> {
    const result = await new Promise<PresignedPost>((resolve) => {
      this.provider.createPresignedPost(
        {
          Bucket: this.bucket,
          Fields: {
            Key: key
          },
          Expires: expiresAfter,
          Conditions: conditions
        },
        (err, data: PresignedPost) => {
          resolve(data)
        }
      )
    })
    await this.createInvalidation([key])
    return {
      fields: result.fields,
      cacheDomain: this.cacheDomain,
      url: result.url,
      local: false
    }
  }

  /**
   * Delete resources in the S3 storage.
   * @param keys List of keys.
   */
  async deleteResources(keys: string[]) {
    // Create batches of 1000 since S3 supports deletion of 1000 object max per request
    const batches = [] as ObjectIdentifierList[]

    let index = 0
    for (let i = 0; i < keys.length; i++) {
      index = Math.floor(i / 1000)
      if (!batches[index]) batches[index] = []
      batches[index].push({ Key: keys[i] })
    }

    const data = await Promise.all(
      batches.map((batch) =>
        this.provider
          .deleteObjects({
            Bucket: this.bucket,
            Delete: { Objects: batch }
          })
          .promise()
      )
    )

    return data
  }

  /**
   * List all the files/folders in the directory.
   * @param folderName Name of folder in the storage.
   * @param recursive If true it will list content from sub folders as well.
   */
  async listFolderContent(folderName: string, recursive = false): Promise<FileContentType[]> {
    const folderContent = await this.listObjects(folderName, recursive)

    const promises: Promise<FileContentType>[] = []

    // Folders
    for (let i = 0; i < folderContent.CommonPrefixes!.length; i++) {
      promises.push(
        new Promise(async (resolve) => {
          const key = folderContent.CommonPrefixes![i].Prefix.slice(0, -1)
          const cont: FileContentType = {
            key,
            url: `${this.bucketAssetURL}/${key}`,
            name: key.split('/').pop()!,
            type: 'folder'
          }
          resolve(cont)
        })
      )
    }

    // Files
    for (let i = 0; i < folderContent.Contents.length; i++) {
      const key = folderContent.Contents[i].Key
      const regexx = /(?:.*)\/(?<name>.*)\.(?<extension>.*)/g
      const query = regexx.exec(key)
      if (query) {
        promises.push(
          new Promise(async (resolve) => {
            const cont: FileContentType = {
              key,
              url: `${this.bucketAssetURL}/${key}`,
              name: query!.groups!.name,
              type: query!.groups!.extension
            }
            resolve(cont)
          })
        )
      }
    }

    return await Promise.all(promises)
  }

  /**
   * Move or copy object from one place to another in the S3 storage.
   * @param oldName Name of the old object.
   * @param newName Name of the new object.
   * @param oldPath Path of the old object.
   * @param newPath Path of the new object.
   * @param isCopy If true it will create a copy of object.
   */
  async moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy = false) {
    const oldFilePath = path.join(oldPath, oldName)
    const newFilePath = path.join(newPath, newName)
    const listResponse = await this.listObjects(oldFilePath, true)

    const result = await Promise.all([
      ...listResponse.Contents.map(async (file) =>
        this.provider
          .copyObject({
            ACL: 'public-read',
            Bucket: this.bucket,
            CopySource: `/${this.bucket}/${file.Key}`,
            Key: path.join(newFilePath, file.Key.replace(oldFilePath, ''))
          })
          .promise()
      )
    ])

    if (!isCopy) await this.deleteResources(listResponse.Contents.map((file) => file.Key))

    return result
  }
}

export default S3Provider
