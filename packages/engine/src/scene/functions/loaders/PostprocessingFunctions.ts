import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import { configureEffectComposer } from '../../../renderer/functions/configureEffectComposer'
import { DisableTransformTagComponent } from '../../../transform/components/DisableTransformTagComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { IgnoreRaycastTagComponent } from '../../components/IgnoreRaycastTagComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PostprocessingComponent, PostprocessingComponentType } from '../../components/PostprocessingComponent'
import { defaultPostProcessingSchema } from '../../constants/PostProcessing'

export const SCENE_COMPONENT_POSTPROCESSING = 'postprocessing'
export const SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES = {
  options: defaultPostProcessingSchema
}

export const deserializePostprocessing: ComponentDeserializeFunction = async function (
  entity: Entity,
  json: ComponentJson<PostprocessingComponentType>
): Promise<void> {
  if (!isClient) return

  addComponent(entity, PostprocessingComponent, parsePostprocessingProperties(json.props))
  addComponent(entity, DisableTransformTagComponent, {})
  addComponent(entity, IgnoreRaycastTagComponent, {})
  addComponent(entity, Object3DComponent, { value: new Object3D() })
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_POSTPROCESSING)
}

export const updatePostprocessing: ComponentUpdateFunction = (_: Entity) => {
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

const parsePostprocessingProperties = (props): PostprocessingComponentType => {
  return {
    options: Object.assign(
      {},
      ...Object.keys(SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES.options).map((k) => {
        return {
          [k]: props.options[k] ?? SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES.options[k]
        }
      })
    )
  }
}
