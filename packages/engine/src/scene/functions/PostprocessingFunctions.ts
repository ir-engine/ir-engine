import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentUpdateFunction
} from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { Object3D } from 'three'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

export const createPostprocessing: ComponentDeserializeFunction = async function (
  entity: Entity,
  json: ComponentJson
): Promise<void> {
  if (!isClient) return

  addComponent(entity, PostprocessingComponent, json.props)
  addComponent(entity, Object3DComponent, { value: new Object3D() })
}

export const updatePostProcessing: ComponentUpdateFunction = (_: Entity) => {
  configureEffectComposer()
}
