export interface ProjectInterface {
  name: string
  version: string
  thumbnailUrl: string
  assets: string[]
  scenes: string[]
  scripts: string[]
  routes: string[]
  // TODO: remove this when github is in
  files: string[]
  clientReactEntryPoint: string
  moduleEntryPoints: string[]
}
