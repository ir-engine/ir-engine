import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { PostprocessingComponent, PostprocessingComponentType } from '../../components/PostprocessingComponent'
import { Object3D } from 'three'
import { configureEffectComposer } from '../../../renderer/functions/configureEffectComposer'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/ComponentNames'

export const SCENE_COMPONENT_POSTPROCESSING = 'postprocessing'

export const deserializePostprocessing: ComponentDeserializeFunction = async function (
  entity: Entity,
  json: ComponentJson
): Promise<void> {
  if (!isClient) return

  addComponent(entity, PostprocessingComponent, json.props)
  addComponent(entity, Object3DComponent, { value: new Object3D() })
}

export const updatePostProcessing: ComponentUpdateFunction = (_: Entity) => {
  console.log('\n\nupdatePostProcessing\n\n')
  configureEffectComposer()
}

export const serializePostprocessing: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, PostprocessingComponent) as PostprocessingComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_POSTPROCESSING,
    props: {
      options: component.options
    }
  }
}
