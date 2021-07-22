import AWS from 'aws-sdk'
import S3BlobStore from 's3-blob-store'
import config from '../../appconfig'
import { StorageProviderInterface } from './storageprovider.interface'

export class S3Provider implements StorageProviderInterface {
  bucket = config.aws.s3.staticResourceBucket
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey,
    region: config.aws.s3.region
  })

  blob: S3BlobStore = new S3BlobStore({
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

  getStorage = (): S3BlobStore => this.blob

  getSignedUrl = async (key: string, expiresAfter: number, conditions): Promise<any> => {
    const result = await new Promise((resolve) => {
      this.provider.createPresignedPost(
        {
          Bucket: config.aws.s3.staticResourceBucket,
          Fields: {
            Key: key
          },
          Expires: expiresAfter,
          Conditions: conditions
        },
        (err, data) => {
          resolve(data)
        }
      )
    })
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
