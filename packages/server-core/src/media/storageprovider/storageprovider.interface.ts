export interface StorageProviderInterface {
  getProvider(): StorageProviderInterface // arrow function
  getStorage(): any
  deleteResources(keys: string[]): Promise<any>
}
