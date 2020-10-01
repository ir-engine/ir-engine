import StorageProviderInterface from './storageprovider.interface';
import AWS from 'aws-sdk';
import config from '../config';
import S3BlobStore from 's3-blob-store';

export default class S3Provider implements StorageProviderInterface {
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey
  })

  blob: S3BlobStore = new S3BlobStore({
    client: this.provider,
    bucket: config.aws.s3.staticResourceBucket,
    ACL: 'public-read'
  })

  getProvider = (): any => this.provider

  getStorage = (): S3BlobStore => this.blob
}
