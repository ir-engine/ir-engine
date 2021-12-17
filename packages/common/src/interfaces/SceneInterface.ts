export interface ComponentJson {
  name: string
  props: any
}
export interface EntityJson {
  name: string
  components: Array<ComponentJson>
  uuid?: string
  parent?: string
  index?: number
}

export interface SceneJson {
  entities: { [uuid: string]: EntityJson }
  root: string
  version: number
}

export interface SceneDetailInterface {
  name: string
  thumbnailUrl: string
  scene?: SceneJson
  project?: string
}
