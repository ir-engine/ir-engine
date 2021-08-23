export interface StorageProviderInterface {
  cacheDomain: string

  checkObjectExistence(key: string): Promise<any>
  getObject(path: string): Promise<any>
  getProvider(): StorageProviderInterface // arrow function
  getSignedUrl(key: string, expiresAfter: number, conditions): Promise<any>
  getStorage(): any
  listObjects(prefix: string): Promise<any>
  putObject(object: any): Promise<any>
  deleteResources(keys: string[]): Promise<any>
  createInvalidation(params: any): Promise<any>
}
