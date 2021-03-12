import { StorageProviderInterface } from './storageprovider.interface';
import AWS from 'aws-sdk';
import config from '../config';
import S3BlobStore from 's3-blob-store';
import { callbackify } from 'util';

export default class S3Provider implements StorageProviderInterface {
  bucket = config.aws.s3.staticResourceBucket;
  provider: AWS.S3 = new AWS.S3({
    accessKeyId: config.aws.keys.accessKeyId,
    secretAccessKey: config.aws.keys.secretAccessKey
  })

  blob: S3BlobStore = new S3BlobStore({
    client: this.provider,
    bucket: this.bucket,
    ACL: 'public-read'
  })


  getProvider = (): any => {
    return this.provider;
  }

  getStorage = (): S3BlobStore => this.blob;

  getSignedUrl = async (filename: string, expiresAfter: number, conditions): Promise<any> => { 
    const result = await new Promise((resolve) => {
      this.provider.createPresignedPost({
        Bucket: this.bucket,
        Fields: {
          Key: filename,
        },
        Expires: expiresAfter,
        Conditions: conditions
      }, (err, data) => {
        resolve(data);
      })
    })
    
    // this.provider.getBucketAcl({
    //   Bucket: this.bucket}, (e, d) => {
    //   console.log('ACL => ', JSON.stringify(d));
    // })
    
    // this.provider.getObjectAcl({
    //   Bucket: this.bucket, 
    //   Key: "file.jpg"
    //  }, (e, d) => {
    //   console.log('Object ACl => ', JSON.stringify(d));
    // }) 
      // this.provider.putBucketCors({
      //   Bucket: this.bucket,
      //   CORSConfiguration: {
      //     CORSRules: [
      //       {
      //         "AllowedHeaders":[],
      //         "AllowedMethods":["HEAD","GET", 'POST'],
      //         "AllowedOrigins":["*"],
      //         "ExposeHeaders":[],
      //       }
      //     ]
      //   }
      // }, (e, d) => {
      //   console.log('UPDATED cors => ', JSON.stringify(d),);
      //   this.provider.getBucketCors({
      //     Bucket: this.bucket}, (e, d) => {
      //     console.log('CORS => ', JSON.stringify(d));
      //   })
        
      // })

    return result;
  }
}
