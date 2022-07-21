import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

/**
 * Put object parameters interface for adding to storage.
 */
export interface PutObjectParams {
  isDirectory?: boolean
}

/**
 * Interface defining storage object.
 */
export interface StorageObjectInterface {
  Key?: string
  Body: Buffer
  ContentType: string
}

/**
 * Interface defining storage list object.
 */
export interface StorageListObjectInterface {
  Prefix?: string
  IsTruncated?: boolean
  NextContinuationToken?: string
  Contents: { Key: string }[]
  CommonPrefixes?: { Prefix: string }[]
}

/**
 * Interface defining signed url response.
 */
export interface SignedURLResponse {
  fields: {
    [key: string]: string
  }
  url: string
  local: boolean
  cacheDomain: string
}

/**
 * Interface defining blob store object.
 */
export interface BlobStore {
  path: string
  cache: any
  createWriteStream(options: string | { key: string }, cb?: (err, result) => void)
  createReadStream(key: string | { key: string }, options?: any)
  exists(options: string | { key: string }, cb?: (err, result) => void)
  remove(options: string | { key: string }, cb?: (err, result) => void)
}

/**
 * Storage provide interface to provide template for storage handling capabilities.
 */
export interface StorageProviderInterface {
  cacheDomain: string

  /**
   * Invalidates items in the storage
   * @param invalidationItems List of keys
   */
  createInvalidation(invalidationItems: string[]): Promise<any>

  /**
   * Deletes resources in the storage
   * @param keys List of keys
   */
  deleteResources(keys: string[]): Promise<any>

  /**
   * Checks if an object exists in the storage
   * @param fileName Name of file in the storage
   * @param directoryPath Directory of file in the storage
   * @returns {Promise<boolean>}
   */
  doesExist(fileName: string, directoryPath: string): Promise<boolean>

  /**
   * Gets the object from edge cache, otherwise returns getObject
   * @param key Key of object
   * @returns {StorageObjectInterface}
   */
  getCachedObject(key: string): Promise<StorageObjectInterface>

  /**
   * Gets the storage object
   * @param key Key of object
   * @returns {StorageObjectInterface}
   */
  getObject(key: string): Promise<StorageObjectInterface>

  /**
   * Gets the instance of current storage provider
   * @returns {StorageProviderInterface}
   */
  getProvider(): StorageProviderInterface

  /**
   * Gets the signed url response of the storage object
   * @param key Key of object
   * @param expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour).
   * @param conditions An array of conditions that must be met for certain providers like S3.
   * @returns {SignedURLResponse}
   */
  getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse>

  /**
   * Gets the BlobStore object for current storage
   * @returns {BlobStore} Blob store
   */
  getStorage(): BlobStore

  /**
   * Checks if an object is directory or not
   * @param fileName Name of file in the storage
   * @param directoryPath Directory of file in the storage
   * @returns {Promise<boolean>}
   */
  isDirectory(fileName: string, directoryPath: string): Promise<boolean>

  /**
   * List all the files/folders in the directory
   * @param folderName Name of folder in the storage
   * @param recursive If true it will list content from sub folders as well
   */
  listFolderContent(folderName: string, recursive?: boolean): Promise<FileContentType[]>

  /**
   * Get a list of keys under a path
   * @param prefix Path relative to root in order to list objects
   * @param recursive If true it will list content from sub folders as well
   * @param continuationToken It indicates that the list is being continued with a token. Used for certain providers like S3.
   * @returns {Promise<StorageListObjectInterface>}
   */
  listObjects(prefix: string, recursive?: boolean, continuationToken?: string): Promise<StorageListObjectInterface>

  /**
   * Moves or copy object from one place to another
   * @param oldName Name of the old object
   * @param newName Name of the new object
   * @param oldPath Path of the old object
   * @param newPath Path of the new object
   * @param isCopy If true it will create a copy of object
   */
  moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean): Promise<any>

  /**
   * Adds an object into the storage
   * @param object Storage object to be added
   * @param params Parameters of the add request
   */
  putObject(object: StorageObjectInterface, params?: PutObjectParams): Promise<any>
}
