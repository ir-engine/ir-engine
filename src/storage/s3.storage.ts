import IStorageProvider from './storageprovider.interface'
import AWS from 'aws-sdk'
// @ts-ignore
import S3BlobStore from 's3-blob-store'

export default class S3Provider implements IStorageProvider {
    provider: AWS.S3 = new AWS.S3({
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY
    })
    blob: S3BlobStore = new S3BlobStore({ client: this.provider, bucket: process.env.S3_BLOB_BUCKET_NAME })
    getProvider = (): any => this.provider
    getStorage = (): S3BlobStore => this.blob
}
