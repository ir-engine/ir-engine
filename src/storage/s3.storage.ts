import IStorageProvider from './storageprovider.interface'
import AWS from 'aws-sdk'
import config from 'config'
import S3BlobStore from 's3-blob-store'

export default class S3Provider implements IStorageProvider {
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.get('aws.keys.access_key_id'),
    secretAccessKey: config.get('aws.keys.secret_access_key'),
  })

  blob: S3BlobStore = new S3BlobStore({ client: this.provider, bucket: config.get('aws.s3.blob_bucket_name'), ACL: 'public-read' })
  getProvider = (): any => this.provider
  getStorage = (): S3BlobStore => this.blob
}
