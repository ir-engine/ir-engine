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

export class S3Provider implements StorageProviderInterface {
  bucket = config.aws.s3.staticResourceBucket
  cacheDomain =
    config.server.storageProvider === 'aws'
      ? config.aws.cloudfront.domain
      : `${config.aws.cloudfront.domain}/${this.bucket}`
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey,
    endpoint: config.aws.s3.endpoint,
    region: config.aws.s3.region,
    s3ForcePathStyle: true,
    maxRetries: 1
  })

  bucketAssetURL =
    config.server.storageProvider === 'aws'
      ? `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com`
      : `https://${config.aws.cloudfront.domain}/${this.bucket}`

  blob: typeof S3BlobStore = new S3BlobStore({
    client: this.provider,
    bucket: config.aws.s3.staticResourceBucket,
    ACL: 'public-read'
  })

  cloudfront: AWS.CloudFront = new AWS.CloudFront({
    region: config.aws.s3.region,
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey
  })

  getProvider = (): StorageProviderInterface => {
    return this
  }

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

  getObject = async (key: string): Promise<StorageObjectInterface> => {
    const data = await this.provider.getObject({ Bucket: this.bucket, Key: key }).promise()
    return { Body: data.Body as Buffer, ContentType: data.ContentType! }
  }

  async getCachedObject(key: string): Promise<StorageObjectInterface> {
    const data = await fetch(getCachedURL(key, this.cacheDomain))
    return { Body: Buffer.from(await data.arrayBuffer()), ContentType: (await data.headers.get('content-type')) || '' }
  }

  getObjectContentType = async (key: string): Promise<any> => {
    const data = await this.provider.headObject({ Bucket: this.bucket, Key: key }).promise()
    return data.ContentType
  }

  listObjects = async (
    prefix: string,
    recursive = true,
    continuationToken?: string
  ): Promise<StorageListObjectInterface> => {
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

  putObject = async (data: StorageObjectInterface, params: PutObjectParams = {}): Promise<any> => {
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

  createInvalidation = async (invalidationItems: any[]): Promise<any> => {
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

  getStorage = (): typeof S3BlobStore => this.blob

  getSignedUrl = async (key: string, expiresAfter: number, conditions): Promise<SignedURLResponse> => {
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

  deleteResources = async (keys: string[]): Promise<any> => {
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

  listFolderContent = async (folderName: string, recursive = false): Promise<FileContentType[]> => {
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
   * @author Nayankumar Patel
   * @param oldName
   * @param oldPath
   * @param newName
   * @param newPath
   * @param isCopy
   * @returns
   */
  moveObject = async (
    oldName: string,
    newName: string,
    oldPath: string,
    newPath: string,
    isCopy = false
  ): Promise<any[]> => {
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
