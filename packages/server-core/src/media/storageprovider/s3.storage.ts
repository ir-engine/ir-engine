import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'
import AWS from 'aws-sdk'
import { PresignedPost } from 'aws-sdk/clients/s3'
import S3BlobStore from 's3-blob-store'
import config from '../../appconfig'
import {
  SignedURLResponse,
  StorageListObjectInterface,
  StorageObjectInterface,
  StorageProviderInterface
} from './storageprovider.interface'

export class S3Provider implements StorageProviderInterface {
  bucket = config.aws.s3.staticResourceBucket
  cacheDomain = config.aws.cloudfront.domain
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey,
    region: config.aws.s3.region
  })

  blob: typeof S3BlobStore = new S3BlobStore({
    client: this.provider,
    bucket: config.aws.s3.staticResourceBucket,
    ACL: 'public-read'
  })

  cloudfront: AWS.CloudFront = new AWS.CloudFront({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey
  })

  getProvider = (): any => {
    return this.provider
  }

  checkObjectExistence = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.provider.getObjectAcl(
        {
          Bucket: this.bucket,
          Key: key
        },
        (err, data) => {
          if (err) {
            if (err.code === 'NoSuchKey') resolve(null)
            else {
              console.error(err)
              reject(err)
            }
          } else {
            reject(new Error(`Object of key ${key} already exists`))
          }
        }
      )
    })
  }

  getObject = async (key: string): Promise<StorageObjectInterface> => {
    return new Promise((resolve, reject) =>
      this.provider.getObject(
        {
          Bucket: this.bucket,
          Key: key
        },
        (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            resolve({
              Body: data.Body as Buffer,
              ContentType: data.ContentType
            })
          }
        }
      )
    )
  }

  getObjectContentType = async (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.provider.headObject(
        {
          Bucket: this.bucket,
          Key: key
        },
        (err, data) => {
          if (err) {
            console.log('Error:' + err)
            reject(err)
          } else {
            resolve(data.ContentType)
          }
        }
      )
    })
  }

  listObjects = async (prefix: string, recursive = false): Promise<StorageListObjectInterface> => {
    return new Promise((resolve, reject) =>
      this.provider.listObjectsV2(
        {
          Bucket: this.bucket,
          Prefix: prefix,
          Delimiter: recursive ? undefined : '/'
        },
        (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            resolve(data as StorageListObjectInterface)
          }
        }
      )
    )
  }

  putObject = async (params: StorageObjectInterface): Promise<any> => {
    return new Promise((resolve, reject) =>
      this.provider.putObject(
        {
          ACL: 'public-read',
          Body: params.Body,
          Bucket: this.bucket,
          ContentType: params.ContentType,
          Key: params.Key
        },
        (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    )
  }

  createInvalidation = async (invalidationItems: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.cloudfront.createInvalidation(
        {
          DistributionId: config.aws.cloudfront.distributionId,
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
              Quantity: invalidationItems.length,
              Items: invalidationItems
            }
          }
        },
        (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    })
  }

  getStorage = (): typeof S3BlobStore => this.blob

  getSignedUrl = async (key: string, expiresAfter: number, conditions): Promise<SignedURLResponse> => {
    const result = await new Promise<PresignedPost>((resolve) => {
      this.provider.createPresignedPost(
        {
          Bucket: config.aws.s3.staticResourceBucket,
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

    await new Promise((resolve, reject) => {
      this.cloudfront.createInvalidation(
        {
          DistributionId: config.aws.cloudfront.distributionId,
          InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
              Quantity: 1,
              Items: [`/${key}`]
            }
          }
        },
        (err, data) => {
          if (err) {
            console.error(err)
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    })
    return {
      fields: result.fields,
      cacheDomain: this.cacheDomain,
      url: result.url,
      local: false
    }
  }

  deleteResources = (keys: string[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.provider.deleteObjects(
        {
          Bucket: config.aws.s3.staticResourceBucket,
          Delete: {
            Objects: keys.map((key) => {
              return { Key: key }
            })
          }
        },
        (err, data) => {
          if (err) reject(err)
          else resolve(data)
        }
      )
    })
  }

  listFolderContent = async (folderName: string): Promise<FileContentType[]> => {
    const folderContent = await this.listObjects(folderName)
    // console.log('folderContent', folderContent)
    const np = new RegExp(`${folderName}${'(?<filename>.*)'}`)
    const promises = []
    // Files
    for (let i = 0; i < folderContent.Contents.length; i++) {
      promises.push(
        new Promise(async (resolve) => {
          const key = folderContent.Contents[i].Key
          const fileName = np.exec(key).groups.filename
          const contentType = await this.getObjectContentType(key)
          const url = `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com/${key}`
          const cont: FileContentType = {
            key,
            url,
            name: fileName,
            type: contentType
          }
          resolve(cont)
        })
      )
    }
    // Folders
    for (let i = 0; i < folderContent.CommonPrefixes.length; i++) {
      promises.push(
        new Promise(async (resolve) => {
          const key = folderContent.CommonPrefixes[i].Prefix.slice(0, -1)
          const url = `https://${this.bucket}.s3.${config.aws.s3.region}.amazonaws.com/${key}`
          const cont: FileContentType = {
            key,
            url,
            name: key.split('/').pop(),
            type: 'folder'
          }
          resolve(cont)
        })
      )
    }
    return await Promise.all(promises)
  }

  async moveObject(current: string, destination: string, isCopy: boolean = false, renameTo: string = null) {
    const promises = []
    promises.push(...(await this._moveObject(current, destination, isCopy, renameTo)))
    await Promise.all(promises)
    return
  }

  private async _moveObject(current: string, destination: string, isCopy: boolean = false, renameTo: string = null) {
    const promises = []
    const listResponse = await this.listObjects(current)

    promises.push(
      ...listResponse.Contents.map(async (file) => {
        await this.provider.copyObject({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${file.Key}`,
          Key: `${destination}${file.Key.replace(listResponse.Prefix, '')}`
        })
        // we have to do these one by one after the copy
        if (!isCopy) {
          await this.deleteResources([file.Key])
        }
      })
    )

    // recursive copy sub-folders
    promises.push(
      ...listResponse.CommonPrefixes.map(async (folder) =>
        this._moveObject(
          `${folder.Prefix}`,
          `${destination}${folder.Prefix.replace(listResponse.Prefix, '')}`,
          isCopy,
          null
        )
      )
    )

    return promises
  }
}
export default S3Provider
