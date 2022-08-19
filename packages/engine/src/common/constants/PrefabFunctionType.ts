import { Object3D } from 'three'

import { Entity } from '../../ecs/classes/Entity'

export type ComponentDeserializeFunction = (entity: Entity, componentData: any) => void
export type ComponentSerializeFunction = (entity: Entity) => any | undefined
/** @todo: deprecate & replace with just `(entity: Entity) => ...` to enable functions to be reactive to data changes, rather than passing properties in */
export type ComponentUpdateFunction = (entity: Entity, properties?: any) => void
export type ComponentShouldDeserializeFunction = () => boolean
export type ComponentPrepareForGLTFExportFunction = (object: Object3D) => void

export type SceneLoaderType = {
  defaultData?: any
  /**
   * an override function to specify custom transformations from ECS to JSON 
   */
  serialize?: ComponentSerializeFunction
  /**
   * an override function to specify custom transformations from JSON to ECS
   */
  deserialize?: ComponentDeserializeFunction
  shouldDeserialize?: ComponentShouldDeserializeFunction
  prepareForGLTFExport?: ComponentPrepareForGLTFExportFunction
}
