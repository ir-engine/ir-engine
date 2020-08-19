export default interface IStorageProvider {
  getProvider (): IStorageProvider // arrow function
  getStorage (): any
}
