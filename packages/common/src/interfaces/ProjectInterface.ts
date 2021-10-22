export interface ProjectPackageInterface {
  thumbnail: string
  routes: string[]
  // TODO: remove these when file browser is in
  clientReactEntryPoint: string
  moduleEntryPoints: string[]
}

export interface ProjectInterface extends ProjectPackageInterface {
  name: string
  // version: string
  storageProviderPath?: string // does not exist in local dev
  repositoryBranch?: string
  repositoryPath: string
  // assets: string[]
  // scenes: string[]
  // scripts: string[]
}
