/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { PassThrough } from 'stream'

import { FileContentType } from '@etherealengine/common/src/interfaces/FileContentType'

/**
 * Put object parameters interface for adding to storage.
 */
export interface PutObjectParams {
  /**
   * True if this a directory.
   */
  isDirectory?: boolean
}

/**
 * Interface defining storage object.
 */
export interface StorageObjectInterface {
  /**
   * Key in the storage.
   */
  Key?: string
  /**
   * Buffer object of the storage.
   */
  Body: Buffer
  /**
   * A standard MIME type describing the format of the object data.
   */
  ContentType: string

  ContentEncoding?: string

  Metadata?: object
}

export interface StorageObjectPutInterface extends Omit<StorageObjectInterface, 'Body'> {
  Body: Buffer | PassThrough
}

/**
 * Interface defining storage list object.
 */
export interface StorageListObjectInterface {
  /**
   * Limits the response to keys that begin with the specified prefix.
   */
  Prefix?: string
  /**
   *  Indicates whether the returned list of parts is truncated. A true value indicates that the list was truncated. A list can be truncated if the number of parts exceeds the limit returned in the MaxParts element.
   */
  IsTruncated?: boolean
  /**
   *  NextContinuationToken is sent when isTruncated is true, which indicates that there are more analytics configurations to list. The next request must include this NextContinuationToken. The token is obfuscated and is not a usable value.
   */
  NextContinuationToken?: string
  /**
   * Metadata about each object returned.
   */
  Contents: { Key: string }[]
  /**
   * All of the keys (up to 1,000) rolled up into a common prefix count as a single return when calculating the number of returns. A response can contain CommonPrefixes only if you specify a delimiter.  CommonPrefixes contains all (if there are any) keys between Prefix and the next occurrence of the string specified by a delimiter.  CommonPrefixes lists keys that act like subdirectories in the directory specified by Prefix. For example, if the prefix is notes/ and the delimiter is a slash (/) as in notes/summer/july, the common prefix is notes/summer/. All of the keys that roll up into a common prefix count as a single return when calculating the number of returns.
   */
  CommonPrefixes?: { Prefix: string }[]
}

/**
 * Interface defining signed url response.
 */
export interface SignedURLResponse {
  /**
   * The fields that must be included as hidden inputs on the form.
   */
  fields: {
    [key: string]: string
  }
  /**
   * The URL that should be used as the action of the form.
   */
  url: string
  /**
   * True if the URL is local storage.
   */
  local: boolean
  /**
   * Domain address of cache.
   */
  cacheDomain: string
}

/**
 * Interface defining blob store object.
 */
export interface BlobStore {
  /**
   * Path for the blob store.
   */
  path: string
  /**
   * Cache for the blob store.
   */
  cache: any
  /**
   * Creates a write stream for the blob store.
   * @param options Options for blob store.
   * @param cb Callback one the stream is ready.
   */
  createWriteStream(options: string | { key: string }, cb?: (err, result) => void)
  /**
   * Creates a read stream for the blob store.
   * @param key Key of object.
   * @param options Options for blob store.
   */
  createReadStream(key: string | { key: string }, options?: any)
  /**
   * Checks whether an object exists in the blob store.
   * @param options Options for blob store.
   * @param cb Callback one the stream is ready.
   */
  exists(options: string | { key: string }, cb?: (err, result) => void)
  /**
   * Removes an object from the blob store.
   * @param options Options for blob store.
   * @param cb Callback one the stream is ready.
   */
  remove(options: string | { key: string }, cb?: (err, result) => void)
}

/**
 * Storage provide interface to provide template for storage handling capabilities.
 */
export interface StorageProviderInterface {
  provider?: any
  /**
   * Domain address of cache.
   */
  cacheDomain: string

  /**
   * Invalidate items in the storage provider.
   * @param invalidationItems List of keys.
   */
  createInvalidation(invalidationItems: string[]): Promise<any>

  associateWithFunction(functionARN: string): Promise<any>

  createFunction(functionName: string, routes: string[]): Promise<any>

  listFunctions(marker: string | null, functions: any[]): Promise<any>

  publishFunction(functionName: string): Promise<any>

  updateFunction(functionName: string, routes: string[]): Promise<any>

  /**
   * Delete resources in the storage provider.
   * @param keys List of keys.
   */
  deleteResources(keys: string[]): Promise<any>

  /**
   * Check if an object exists in the storage provider.
   * @param fileName Name of file in the storage provider.
   * @param directoryPath Directory of file in the storage provider.
   * @returns {Promise<boolean>}
   */
  doesExist(fileName: string, directoryPath: string): Promise<boolean>

  /**
   * Get the object from edge cache, otherwise returns getObject.
   * @param key Key of object.
   * @returns {StorageObjectInterface}
   */
  getCachedObject(key: string): Promise<StorageObjectInterface>

  /**
   * Get the storage object.
   * @param key Key of object.
   * @returns {StorageObjectInterface}
   */
  getObject(key: string): Promise<StorageObjectInterface>

  /**
   * Get the instance of current storage provider.
   * @returns {StorageProviderInterface}
   */
  getProvider(): StorageProviderInterface

  /**
   * Get the signed url response of the storage object.
   * @param key Key of object.
   * @param expiresAfter The number of seconds for which signed policy should be valid. Defaults to 3600 (one hour).
   * @param conditions An array of conditions that must be met for certain providers like S3.
   * @returns {SignedURLResponse}
   */
  getSignedUrl(key: string, expiresAfter: number, conditions): Promise<SignedURLResponse>

  /**
   * Get the BlobStore object for current storage.
   * @returns {BlobStore} Blob store.
   */
  getStorage(): BlobStore

  /**
   * Check if an object is directory or not.
   * @param fileName Name of file in the storage.
   * @param directoryPath Directory of file in the storage.
   * @returns {Promise<boolean>}
   */
  isDirectory(fileName: string, directoryPath: string): Promise<boolean>

  /**
   * List all the files/folders in the directory.
   * @param folderName Name of folder in the storage.
   * @param recursive If true it will list content from sub folders as well.
   */
  listFolderContent(folderName: string, recursive?: boolean): Promise<FileContentType[]>

  /**
   * Get a list of keys under a path.
   * @param prefix Path relative to root in order to list objects.
   * @param recursive If true it will list content from sub folders as well.
   * @param continuationToken It indicates that the list is being continued with a token. Used for certain providers like S3.
   * @returns {Promise<StorageListObjectInterface>}
   */
  listObjects(prefix: string, recursive?: boolean, continuationToken?: string): Promise<StorageListObjectInterface>

  /**
   * Move or copy object from one place to another.
   * @param oldName Name of the old object.
   * @param newName Name of the new object.
   * @param oldPath Path of the old object.
   * @param newPath Path of the new object.
   * @param isCopy If true it will create a copy of object.
   */
  moveObject(oldName: string, newName: string, oldPath: string, newPath: string, isCopy?: boolean): Promise<any>

  /**
   * Adds an object into the storage.
   * @param object Storage object to be added.
   * @param params Parameters of the add request.
   */
  putObject(object: StorageObjectPutInterface, params?: PutObjectParams): Promise<any>
}
