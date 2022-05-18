import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

export interface PutObjectParams {
  isDirectory?: boolean
}
export interface StorageObjectInterface {
  Key?: string
  Body: Buffer
  ContentType: string
}

export interface StorageListObjectInterface {
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

export interface StorageProviderInterface {
  cacheDomain: string

  /**
   * Checks if an object exists
   * @param key
   * @returns {Promise<boolean>}
   */
  doesExist(fileName: string, directoryPath: string): Promise<boolean>

  /**
   * Checks if an object is directory or not
   * @param key
   * @returns {Promise<boolean>}
   */
  isDirectory(fileName: string, directoryPath: string): Promise<boolean>

  /**
   * Gets the object
   * @param key
   * @returns {StorageObjectInterface}
   */
  getObject(key: string): Promise<StorageObjectInterface>

  /**
   * Gets the provider
   * @returns {StorageProviderInterface}
   */
  getProvider(): StorageProviderInterface

  /**
   *
   * @param key
   * @param expiresAfter
   * @param conditions
   * @returns {SignedURLResponse}
   */
  getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse>

  /**
   * @returns {any} Blob store
   */
  getStorage(): BlobStore

  /**
   * Get a list of keys under a path
   * @param prefix
   * @param recursive
   * @param continuationToken
   * @returns {Promise<StorageListObjectInterface>}
   */
  listObjects(prefix: string, recursive?: boolean, continuationToken?: string): Promise<StorageListObjectInterface>

  /**
   * Puts an object into the store
   * @param object
   * @returns {any}
   */
  putObject(object: StorageObjectInterface, params?: PutObjectParams): Promise<any>

  /**
   * Deletes resources in the store
   * @param keys
   */
  deleteResources(keys: string[]): Promise<any>

  /**
   * Invalidates items in the store
   * @param invalidationItems list of keys
   */
  createInvalidation(invalidationItems: string[]): Promise<any>

  /**
   * List all the files/folders in the directory
   * @param folderName
   */
  listFolderContent(folderName: string, recursive?: boolean): Promise<FileContentType[]>

  /**
   * Moves or copy object from one place to another
   * @param oldName
   * @param oldPath
   * @param newName
   * @param newPath
   * @param isCopy
   */
  moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean): Promise<any>
}
