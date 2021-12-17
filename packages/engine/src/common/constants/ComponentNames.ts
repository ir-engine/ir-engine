import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../ecs/classes/Entity'

export type ComponentDeserializeFunction = (entity: Entity, componentData: ComponentJson) => void
export type ComponentSerializeFunction = (entity: Entity) => ComponentJson | undefined
export type ComponentUpdateFunction = (entity: Entity) => void
export type ComponentShouldDeserializeFunction = () => boolean

export type SceneLoaderType = {
  serialize: ComponentSerializeFunction
  deserialize: ComponentDeserializeFunction
  update?: ComponentUpdateFunction
  shouldDeserialize?: ComponentShouldDeserializeFunction
}
