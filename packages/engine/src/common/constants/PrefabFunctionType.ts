import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Entity } from '../../ecs/classes/Entity'

export type ComponentDeserializeFunction = (entity: Entity, componentData: ComponentJson) => void
export type ComponentSerializeFunction = (entity: Entity) => ComponentJson | undefined
/** @todo: deprecate & replace with just `(entity: Entity) => ...` to enable functions to be reactive to data changes, rather than passing properties in */
export type ComponentUpdateFunction = (entity: Entity, properties?: any) => void
export type ComponentShouldDeserializeFunction = () => boolean
export type ComponentPrepareForGLTFExportFunction = (object: Object3D) => void

export type SceneLoaderType = {
  serialize: ComponentSerializeFunction
  deserialize: ComponentDeserializeFunction
  update?: ComponentUpdateFunction
  shouldDeserialize?: ComponentShouldDeserializeFunction
  prepareForGLTFExport?: ComponentPrepareForGLTFExportFunction
}
