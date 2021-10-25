export interface StorageObjectInterface {
  Key?: string
  Body: Buffer
  ContentType: string
}

export interface StorageListObjectInterface {
  Contents: { Key: string }[]
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
   * @returns {Promise<null>}
   * @throws {Error}
   *
   */
  checkObjectExistence(key: string): Promise<any>

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
   * @returns {Promise<StorageListObjectInterface>}
   */
  listObjects(prefix: string): Promise<StorageListObjectInterface>

  /**
   * Puts an object into the store
   * @param object
   * @returns {any}
   */
  putObject(object: StorageObjectInterface): Promise<any>

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

  // /**
  //  * Create a new Folder in Store
  //  * @param dir
  //  */
  // createDirectory(dir): Promise<boolean>

  /**
   * List all the files/folders in the directory
   * @param folderName
   */
  listFolderContent(folderName: string): Promise<any>

  // /**
  //  * Move content to/from a directory
  //  * @param current
  //  * @param destination
  //  * @param isCopy
  //  * @param isRename
  //  */
  // moveContent(current: string, destination: string, isCopy: boolean, isRename: string): Promise<any>

  // /**
  //  * Delete content using its path
  //  * @param contentPath
  //  */
  // deleteContent(contentPath: string, type: string): Promise<any>
}
