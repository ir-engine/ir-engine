import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ScreenshareTargetComponent, ScreenshareTargetComponentType } from '../../components/ScreenshareTargetComponent'

export const SCENE_COMPONENT_SCREENSHARETARGET = 'screensharetarget'
export const SCENE_COMPONENT_SCREENSHARETARGET_DEFAULT_VALUES = {}

export const deserializeScreenshareTarget: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ScreenshareTargetComponentType>
) => {
  const props = parseScreenshareTargetProperties(json.props)
  addComponent(entity, ScreenshareTargetComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SCREENSHARETARGET)

  updateScreenshareTarget(entity, props)
}

export const updateScreenshareTarget: ComponentUpdateFunction = (
  entity: Entity,
  properties: ScreenshareTargetComponentType
) => {}

export const serializeScreenshareTarget: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ScreenshareTargetComponent) as ScreenshareTargetComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SCREENSHARETARGET,
    props: {}
  }
}

const parseScreenshareTargetProperties = (props): ScreenshareTargetComponentType => {
  return {}
}
