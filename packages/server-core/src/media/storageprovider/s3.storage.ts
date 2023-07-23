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

import {
  CloudFrontClient,
  CreateFunctionCommand,
  CreateInvalidationCommand,
  DescribeFunctionCommand,
  FunctionSummary,
  GetDistributionCommand,
  ListFunctionsCommand,
  ListFunctionsCommandInput,
  PublishFunctionCommand,
  UpdateDistributionCommand,
  UpdateFunctionCommand
} from '@aws-sdk/client-cloudfront'
import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Options, Upload } from '@aws-sdk/lib-storage'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import appRootPath from 'app-root-path'
import fs from 'fs'
import { reject } from 'lodash'
import fetch from 'node-fetch'
import { buffer } from 'node:stream/consumers'
import path from 'path/posix'
import S3BlobStore from 's3-blob-store'
import { PassThrough, Readable } from 'stream'

import { FileContentType } from '@etherealengine/common/src/interfaces/FileContentType'

import config from '../../appconfig'
import { getCacheDomain } from './getCacheDomain'
import { getCachedURL } from './getCachedURL'
import {
  PutObjectParams,
  SignedURLResponse,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageObjectPutInterface,
  StorageProviderInterface
} from './storageprovider.interface'

const MAX_ITEMS = 1
const CFFunctionTemplate = `
function handler(event) {
    var request = event.request;
    var routeRegexRoot = __$routeRegex$__
    var routeRegex = new RegExp(routeRegexRoot)
    var publicRegexRoot = __$publicRegex$__
    var publicRegex = new RegExp(publicRegexRoot)

    if (routeRegex.test(request.uri)) {
        request.uri = '/client/index.html'
    }
    
    if (publicRegex.test(request.uri)) {
        request.uri = '/client' + request.uri
    }
    return request;
}
`

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
  provider: S3Client = new S3Client({
    credentials: {
      accessKeyId: config.aws.s3.accessKeyId,
      secretAccessKey: config.aws.s3.secretAccessKey
    },
    endpoint: config.server.storageProviderExternalEndpoint
      ? config.server.storageProviderExternalEndpoint
      : config.aws.s3.endpoint,
    region: config.aws.s3.region,
    forcePathStyle: true,
    tls: config.aws.s3.s3DevMode === 'local' ? false : undefined,
    maxAttempts: 5
  })

  /**
   * Domain address of S3 cache.
   */
  cacheDomain =
    config.server.storageProvider === 's3'
      ? config.aws.s3.endpoint
        ? `${config.aws.s3.endpoint.replace('http://', '').replace('https://', '')}/${this.bucket}`
        : config.aws.cloudfront.domain
      : `${config.aws.cloudfront.domain}/${this.bucket}`

  private bucketAssetURL =
    config.server.storageProvider === 's3'
      ? config.aws.s3.endpoint
        ? `${config.aws.s3.endpoint}/${this.bucket}`
        : `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com`
      : `https://${config.aws.cloudfront.domain}/${this.bucket}`

  private blob: typeof S3BlobStore = new S3BlobStore({
    client: this.provider,
    bucket: config.aws.s3.staticResourceBucket,
    ACL: 'public-read'
  })

  private cloudfront: CloudFrontClient = new CloudFrontClient({
    region: config.aws.cloudfront.region,
    credentials: {
      accessKeyId: config.aws.s3.accessKeyId,
      secretAccessKey: config.aws.s3.secretAccessKey
    }
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
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: path.join(directoryPath, fileName),
      MaxKeys: 1
    })
    try {
      const response = await this.provider.send(command)
      return (response.Contents && response.Contents.length > 0) || false
    } catch {
      return false
    }
  }
  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   */
  async isDirectory(fileName: string, directoryPath: string): Promise<boolean> {
    // last character of the key of directory is '/'
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.htmlhow to
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: path.join(directoryPath, fileName),
      MaxKeys: 1
    })
    try {
      const response = await this.provider.send(command)
      return response?.Contents?.[0]?.Key?.endsWith('/') || false
    } catch {
      return false
    }
  }

  /**
   * Get the S3 storage object.
   * @param key Key of object.
   */
  async getObject(key: string): Promise<StorageObjectInterface> {
    const data = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    const response = await this.provider.send(data)
    const body = await buffer(response.Body as Readable)
    return { Body: body, ContentType: response.ContentType! }
  }

  /**
   * Get the object from cache.
   * @param key Key of object.
   */
  async getCachedObject(key: string): Promise<StorageObjectInterface> {
    const cacheDomain = getCacheDomain(this, true)
    const data = await fetch(getCachedURL(key, cacheDomain))
    return { Body: Buffer.from(await data.arrayBuffer()), ContentType: (await data.headers.get('content-type')) || '' }
  }

  /**
   * Get the content type of storage object.
   * @param key Key of object.
   */
  async getObjectContentType(key: string): Promise<any> {
    const data = new HeadObjectCommand({ Bucket: this.bucket, Key: key })
    const response = await this.provider.send(data)
    return response.ContentType
  }

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well. Default is true.
   * @param continuationToken It indicates that the list is being continued with a token. Used for certain providers like S3.
   * @returns {Promise<StorageListObjectInterface>}
   */
  async listObjects(prefix: string, recursive = true, continuationToken?: string): Promise<StorageListObjectInterface> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      ContinuationToken: continuationToken,
      Prefix: prefix,
      Delimiter: recursive ? undefined : '/'
    })
    const response = await this.provider.send(command)
    if (!response.Contents) response.Contents = []
    if (!response.CommonPrefixes) response.CommonPrefixes = []

    if (response.IsTruncated) {
      const _data = await this.listObjects(prefix, recursive, response.NextContinuationToken)
      response.Contents = response.Contents.concat(_data.Contents)
      if (_data.CommonPrefixes) response.CommonPrefixes = response.CommonPrefixes.concat(_data.CommonPrefixes)
    }

    return response as StorageListObjectInterface
  }

  /**
   * Adds an object into the S3 storage.
   * @param data Storage object to be added.
   * @param params Parameters of the add request.
   */
  async putObject(data: StorageObjectPutInterface, params: PutObjectParams = {}): Promise<any> {
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

    if (data.ContentEncoding) (args as StorageObjectInterface).ContentEncoding = data.ContentEncoding

    if (data.Metadata) (args as StorageObjectInterface).Metadata = data.Metadata

    if (data.Body instanceof PassThrough) {
      try {
        const upload = new Upload(args as unknown as Options)
        upload.on('httpUploadProgress', (progress) => {
          console.log(progress)
          // if (params.onProgress) params.onProgress(progress.loaded, progress.total)
        })
        return upload.done()
      } catch (err) {
        reject(err)
      }
    } else {
      const command = new PutObjectCommand(args)
      const response = await this.provider.send(command)
      return response
    }
  }

  /**
   * Invalidate items in the S3 storage.
   * @param invalidationItems List of keys.
   */
  async createInvalidation(invalidationItems: string[]) {
    if (!invalidationItems || invalidationItems.length === 0) return
    // for non-standard s3 setups, we don't use cloudfront
    if (config.server.storageProvider !== 's3' || config.aws.s3.s3DevMode === 'local') return
    const params = {
      DistributionId: config.aws.cloudfront.distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: invalidationItems.length,
          Items: invalidationItems.map((item) => (item[0] !== '/' ? `/${item}` : item))
        }
      }
    }
    const command = new CreateInvalidationCommand(params)
    return await this.cloudfront.send(command)
  }

  async listFunctions(marker: string | null, functions: FunctionSummary[]): Promise<FunctionSummary[]> {
    if (config.server.storageProvider !== 's3') return []
    const params: ListFunctionsCommandInput = {
      MaxItems: MAX_ITEMS
    }
    if (marker) params.Marker = marker
    const command = new ListFunctionsCommand(params)
    const response = await this.cloudfront.send(command)
    functions = functions.concat(response.FunctionList?.Items ? response.FunctionList.Items : [])
    if (response.FunctionList?.NextMarker) return this.listFunctions(response.FunctionList?.NextMarker, functions)
    else return functions
  }

  getFunctionCode(routes: string[]) {
    let routeRegex = ''
    for (let route of routes)
      if (route !== '/')
        switch (route) {
          case '/admin':
          case '/editor':
          case '/studio':
            routeRegex += `^${route}$$|` // String.replace will convert this to a single $
            routeRegex += `^${route}/|`
            break
          case '/location':
          case '/auth':
          case '/capture':
            routeRegex += `^${route}/|`
            break
          default:
            routeRegex += `^${route}$$|` // String.replace will convert this to a single $
            break
        }
    if (routes.length > 0) routeRegex = routeRegex.slice(0, routeRegex.length - 1)
    let publicRegex = ''
    fs.readdirSync(path.join(appRootPath.path, 'packages', 'client', 'dist'), { withFileTypes: true }).forEach(
      (dirent) => {
        if (dirent.name !== 'projects') {
          if (dirent.isDirectory()) publicRegex += `^/${dirent.name}/|`
          else {
            // .br compressed files are uploaded to S3 without this extension in their name, but with a
            // content-encoding header to mark them as brotli-compressed. Need to use the sans-.br name for
            // the CloudFront redirect rule.
            if (/.br$/.test(dirent.name)) dirent.name = dirent.name.replace('.br', '')
            publicRegex += `^/${dirent.name}|`
          }
        }
      }
    )
    if (publicRegex.length > 0) publicRegex = publicRegex.slice(0, publicRegex.length - 1)
    return CFFunctionTemplate.replace('__$routeRegex$__', `'${routeRegex}'`).replace(
      '__$publicRegex$__',
      `'${publicRegex}'`
    )
  }

  async createFunction(functionName: string, routes: string[]) {
    const code = this.getFunctionCode(routes)
    const params = {
      Name: functionName,
      FunctionCode: new TextEncoder().encode(code),
      FunctionConfig: {
        Comment: 'Function to handle routing of Ethereal Engine client',
        Runtime: 'cloudfront-js-1.0'
      }
    }
    const command = new CreateFunctionCommand(params)
    return await this.cloudfront.send(command)
  }

  async associateWithFunction(functionARN: string, attempts = 1) {
    try {
      const getDistributionParams = {
        Id: config.aws.cloudfront.distributionId
      }
      const getDistributionCommand = new GetDistributionCommand(getDistributionParams)
      const distribution = await this.cloudfront.send(getDistributionCommand)
      if (!distribution.Distribution) return
      const updateDistributionParams = {
        Id: distribution.Distribution.Id,
        DistributionConfig: distribution.Distribution.DistributionConfig,
        IfMatch: distribution.ETag
      }
      updateDistributionParams.DistributionConfig!.DefaultCacheBehavior!.FunctionAssociations = {
        Quantity: 1,
        Items: [
          {
            FunctionARN: functionARN,
            EventType: 'viewer-request'
          }
        ]
      }
      const updateDistributionCommand = new UpdateDistributionCommand(updateDistributionParams)
      return await this.cloudfront.send(updateDistributionCommand)
    } catch (err) {
      console.log('error in update distribution', err, err.$metadata)
      if (err.$metadata.httpStatusCode === 412 && attempts <= 5) {
        console.log('Updated Distribution Command failed with error code 412, attempting again')
        setTimeout(() => {
          return this.associateWithFunction(functionARN, attempts + 1)
        }, 3000)
      } else throw err
    }
  }

  async publishFunction(functionName: string) {
    const functionDetailsParams = {
      Name: functionName
    }
    const functionDetailsCommand = new DescribeFunctionCommand(functionDetailsParams)
    const functionDetails = await this.cloudfront.send(functionDetailsCommand)
    const params = {
      Name: functionName,
      IfMatch: functionDetails.ETag
    }
    const command = new PublishFunctionCommand(params)
    return await this.cloudfront.send(command)
  }

  async updateFunction(functionName: string, routes: string[]) {
    const code = this.getFunctionCode(routes)
    const functionDetailsParams = {
      Name: functionName
    }
    const functionDetailsCommand = new DescribeFunctionCommand(functionDetailsParams)
    const functionDetails = await this.cloudfront.send(functionDetailsCommand)
    const params = {
      Name: functionName,
      IfMatch: functionDetails.ETag,
      FunctionCode: new TextEncoder().encode(code),
      FunctionConfig: {
        Comment: 'Function to handle routing of Ethereal Engine client',
        Runtime: 'cloudfront-js-1.0'
      }
    }
    const command = new UpdateFunctionCommand(params)
    return await this.cloudfront.send(command)
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
    const Bucket = this.bucket
    const Key = key
    const Conditions = conditions
    const client = this.provider
    const result = await createPresignedPost(client, {
      Bucket,
      Conditions,
      Key,
      Expires: expiresAfter
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
    const batches = [] as ObjectIdentifier[][]

    let index = 0
    for (let i = 0; i < keys.length; i++) {
      index = Math.floor(i / 1000)
      if (!batches[index]) batches[index] = []
      batches[index].push({ Key: keys[i] })
    }

    return await Promise.all(
      batches.map(async (batch) => {
        const input = {
          Bucket: this.bucket,
          Delete: { Objects: batch }
        }
        const command = new DeleteObjectsCommand(input)
        return await this.provider.send(command)
      })
    )
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
      ...listResponse.Contents.map(async (file) => {
        const input = {
          ACL: 'public-read',
          Bucket: this.bucket,
          CopySource: `/${this.bucket}/${file.Key}`,
          Key: path.join(newFilePath, file.Key.replace(oldFilePath, ''))
        }
        const command = new CopyObjectCommand(input)
        const response = await this.provider.send(command)
        return response
      })
    ])

    if (!isCopy) await this.deleteResources(listResponse.Contents.map((file) => file.Key))

    return result
  }
}

export default S3Provider
