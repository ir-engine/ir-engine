export interface ProjectPackageInterface {
  thumbnail: string
  routes: string[]
}

export interface ProjectInterface extends ProjectPackageInterface {
  id?: string
  name: string
  // version: string
  thumbnail: string
  storageProviderPath?: string // does not exist in local dev
  repositoryPath: string
  // assets: string[]
  // scenes: string[]
  // scripts: string[]
}
