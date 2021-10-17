export interface ProjectInterface {
  name: string
  version: string
  thumbnail: string
  assets: string[]
  scenes: string[]
  scripts: string[]
  routes: {
    [route: string]: string
  }
  // TODO: remove this when github is in
  files: string[]
  clientReactEntryPoint: string
  moduleEntryPoints: string[]
}
