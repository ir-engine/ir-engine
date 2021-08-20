import AWS from 'aws-sdk'
import { PresignedPost } from 'aws-sdk/clients/s3'
import S3BlobStore from 's3-blob-store'
import config from '../../appconfig'
import { StorageProviderInterface } from './storageprovider.interface'
import {
  MAX_AVATAR_FILE_SIZE,
  MIN_AVATAR_FILE_SIZE,
  PRESIGNED_URL_EXPIRATION_DURATION
} from '@xrengine/common/src/constants/AvatarConstants'

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
            reject(new Error('Pack already exists'))
          }
        }
      )
    })
  }

  getObject = async (key: string): Promise<any> => {
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
            resolve(data)
          }
        }
      )
    )
  }

  listObjects = async (prefix: string): Promise<any> => {
    return new Promise((resolve, reject) =>
      this.provider.listObjectsV2(
        {
          Bucket: this.bucket,
          Prefix: prefix
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

  putObject = async (params: any): Promise<any> => {
    return new Promise((resolve, reject) =>
      this.provider.putObject(
        {
          ACL: params.ACL,
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

  getSignedUrl = async (key: string, expiresAfter: number, conditions): Promise<any> => {
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
    ;(result as any).cacheDomain = this.cacheDomain
    return result
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
}
export default S3Provider
