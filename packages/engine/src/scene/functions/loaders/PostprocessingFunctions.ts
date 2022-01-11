import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { PostprocessingComponent, PostprocessingComponentType } from '../../components/PostprocessingComponent'
import { Object3D } from 'three'
import { configureEffectComposer } from '../../../renderer/functions/configureEffectComposer'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { defaultPostProcessingSchema } from '../../constants/PostProcessing'
import { IgnoreRaycastTagComponent } from '../../components/IgnoreRaycastTagComponent'
import { DisableTransformTagComponent } from '../../../transform/components/DisableTransformTagComponent'

export const SCENE_COMPONENT_POSTPROCESSING = 'postprocessing'
export const SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES = defaultPostProcessingSchema

export const deserializePostprocessing: ComponentDeserializeFunction = async function (
  entity: Entity,
  json: ComponentJson<PostprocessingComponentType>
): Promise<void> {
  if (!isClient) return

  addComponent(entity, PostprocessingComponent, json.props)
  addComponent(entity, DisableTransformTagComponent, {})
  addComponent(entity, IgnoreRaycastTagComponent, {})
  addComponent(entity, Object3DComponent, { value: new Object3D() })
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_POSTPROCESSING)
}

export const updatePostProcessing: ComponentUpdateFunction = (_: Entity) => {
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

export const shouldDeserializePostprocessing: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(PostprocessingComponent) <= 0
}
