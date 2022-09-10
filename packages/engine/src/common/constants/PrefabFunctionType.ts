import { Object3D } from 'three'

import { Entity } from '../../ecs/classes/Entity'

export type ComponentDeserializeFunction = (entity: Entity, componentData: any) => void
export type ComponentSerializeFunction = (entity: Entity) => any | undefined
/** @todo: deprecate & replace with just `(entity: Entity) => ...` to enable functions to be reactive to data changes, rather than passing properties in */
export type ComponentUpdateFunction = (entity: Entity) => void
export type ComponentShouldDeserializeFunction = () => boolean
export type ComponentPrepareForGLTFExportFunction = (object: Object3D) => void

export type SceneLoaderType = {
  defaultData?: any
  /**
   * An override function to specify custom transformations from ECS to JSON
   * - if no function is set, data will be copied from the component via JSON serialization
   * - a function returning null or undefined will not add the component to JSON
   */
  serialize?: ComponentSerializeFunction
  /**
   * An override function to specify custom transformations from JSON to ECS
   * - if no function is set, data will be copied to the component
   * - not setting defaultData will result in this component being treated as a tag component
   */
  deserialize?: ComponentDeserializeFunction
  shouldDeserialize?: ComponentShouldDeserializeFunction
}
