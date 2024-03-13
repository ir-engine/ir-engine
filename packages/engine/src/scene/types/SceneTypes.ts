import { EntityUUID } from '@etherealengine/ecs'

export type ComponentJsonType = {
  name: string
  props?: any
}

export type EntityJsonType = {
  name: string | EntityUUID
  components: ComponentJsonType[]
  parent?: EntityUUID
  index?: number
}

export type SceneJsonType = {
  entities: Record<EntityUUID, EntityJsonType>
  root: EntityUUID
  version: number
}
