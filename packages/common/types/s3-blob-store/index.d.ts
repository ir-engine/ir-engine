declare module 's3-blob-store'{
  class S3BlobStore {
    constructor(client?: any, bucket?: any)
    bucket: string
    exists?: any
    createWriteStream?: any
  }
  export = S3BlobStore
}
