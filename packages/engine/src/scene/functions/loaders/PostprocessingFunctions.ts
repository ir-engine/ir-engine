import { Object3D } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import { IgnoreRaycastTagComponent } from '../../components/IgnoreRaycastTagComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PostprocessingComponent, PostprocessingComponentType, SCENE_COMPONENT_POSTPROCESSING_DEFAULT_VALUES } from '../../components/PostprocessingComponent'

export const deserializePostprocessing: ComponentDeserializeFunction = async function (
  entity: Entity,
  data: PostprocessingComponentType
): Promise<void> {
  addComponent(entity, PostprocessingComponent, parsePostprocessingProperties(data))
  addComponent(entity, IgnoreRaycastTagComponent, {})
  addComponent(entity, Object3DComponent, { value: new Object3D() })
}

export const serializePostprocessing: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, PostprocessingComponent) as PostprocessingComponentType
  return {
    options: component.options
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
