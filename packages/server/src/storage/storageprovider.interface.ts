export interface StorageProviderInterface {
  getProvider (): StorageProviderInterface; // arrow function
  getStorage (): any;
}