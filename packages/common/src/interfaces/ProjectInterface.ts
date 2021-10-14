// TODO: rename to projects

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
}
