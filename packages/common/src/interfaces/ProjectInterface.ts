export interface ProjectPackageInterface {
  thumbnail: string
  routes: string[]
  // TODO: remove these when file browser is in
  clientReactEntryPoint: string
  moduleEntryPoints: string[]
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
