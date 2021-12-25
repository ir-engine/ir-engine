import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

export interface IPFSStorageObjectInterface {
  Key?: string
  Body: Buffer
  ContentType?: string
}

export interface IPFSStorageListObjectInterface {
  Prefix?: string
  IsTruncated?: boolean
  NextContinuationToken?: string
  Contents: { Key: string }[]
  CommonPrefixes?: { Prefix: string }[]
}

export interface SignedURLResponse {
  fields: {
    [key: string]: string
  }
  url: string
  local: boolean
  cacheDomain: string
}

export interface BlobStore {
  path: string
  cache: any
  createWriteStream(options: string | { key: string }, cb?: (err, result) => void)
  createReadStream(key: string | { key: string }, options?: any)
  exists(options: string | { key: string }, cb?: (err, result) => void)
  remove(options: string | { key: string }, cb?: (err, result) => void)
}

export interface IPFSStorageProviderInterface {
  cacheDomain: string

  /**
   * Checks if an object exists
   * @param key
   * @returns {Promise<null>}
   * @throws {Error}
   *
   */
  //checkObjectExistence(key: string): Promise<any>

  /**
   * Gets the object
   * @param key
   * @returns {IPFSStorageObjectInterface}
   */
  getObject(key: string): Promise<IPFSStorageObjectInterface>

  /**
   * Gets the provider
   * @returns {IPFSStorageProviderInterface}
   */
  getProvider(): IPFSStorageProviderInterface

  /**
   *
   * @param key
   * @param expiresAfter
   * @param conditions
   * @returns {SignedURLResponse}
   */
  //getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse>

  /**
   * @returns {any} Blob store
   */
  //getStorage(): BlobStore

  /**
   * Get a list of keys under a path
   * @param prefix
   * @param results
   * @param recursive
   * @param continuationToken
   * @returns {Promise<StorageListObjectInterface>}
   */
  // listObjects(
  //   prefix: string,
  //   results,
  //   recursive?: boolean,
  //   continuationToken?: string
  // ): Promise<IPFSStorageListObjectInterface>

  /**
   * Puts an object into the store
   * @param object
   * @returns {any}
   */
  putObject(object: IPFSStorageObjectInterface): Promise<any>

  /**
   * Deletes resources in the store
   * @param keys
   */
  deleteResource(key: string): Promise<any>

  /**
   * Invalidates items in the store
   * @param invalidationItems list of keys
   */
  //createInvalidation(invalidationItems: string[]): Promise<any>

  /**
   * List all the files/folders in the directory
   * @param folderName
   */
  //listFolderContent(folderName: string, recursive?: boolean): Promise<FileContentType[]>

  /**
   * Moves a directory
   * @param current
   * @param destination
   * @param isCopy
   * @param isRename
   */
  //moveObject(current: string, destination: string, isCopy?: boolean, isRename?: string): Promise<any>
}
