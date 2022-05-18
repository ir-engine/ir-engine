export interface ComponentJson<T extends any = any> {
  // todo: eventually remove '= any'
  name: string
  props: T
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

export interface SceneMetadata {
  name: string
  thumbnailUrl: string
  project: string
}

export interface SceneData extends SceneMetadata {
  scene: SceneJson
}
