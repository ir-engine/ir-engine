export interface ComponentJson<T extends any = any> {
  // todo: eventually remove '= any'
  name: string
  props: T
}
export interface EntityJson {
  name: string
  components: Array<ComponentJson>
  parent?: string
  index?: number
}

export interface SceneJson {
  metadata: { [uuid: string]: any }
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
