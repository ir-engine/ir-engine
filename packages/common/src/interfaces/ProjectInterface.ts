export interface ProjectPackageInterface {
  name: string
  version: string
  thumbnailUrl: string
  assets: string[]
  scenes: string[]
  scripts: string[]
  routes: string[]
  // TODO: remove these when file browser is in
  clientReactEntryPoint: string
  moduleEntryPoints: string[]
}

export interface ProjectInterface extends ProjectPackageInterface {
  storageProviderPath?: string // does not exist in local dev
  repositoryBranch?: string
  repositoryPath: string
}
