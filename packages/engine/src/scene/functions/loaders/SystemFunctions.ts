import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { SystemComponent, SystemComponentType } from '../../components/SystemComponent'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const SCENE_COMPONENT_SYSTEM = 'system'
export const SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES = {
  filePath: '',
  systemUpdateType: SystemUpdateType.UPDATE,
  enableClient: true,
  enableServer: true,
  args: {}
}

export const deserializeSystem: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<SystemComponentType>
) => {
  const props = parseSystemProperties(json.props)
  addComponent(entity, SystemComponent, props)
  addComponent(entity, PreventBakeTagComponent, {})

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SYSTEM)

  updateSystem(entity)
}

export const updateSystem: ComponentUpdateFunction = (_: Entity) => {}

export const serializeSystem: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SystemComponent) as SystemComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SYSTEM,
    props: {
      filePath: component.filePath,
      systemUpdateType: component.systemUpdateType,
      enableClient: component.enableClient,
      enableServer: component.enableServer,
      args: component.args
    }
  }
}

const parseSystemProperties = (props): SystemComponentType => {
  return {
    filePath: props.filePath ?? SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES.filePath,
    systemUpdateType: props.systemUpdateType ?? SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES.systemUpdateType,
    enableClient: props.enableClient ?? SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES.enableClient,
    enableServer: props.enableServer ?? SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES.enableServer,
    args: props.args ?? SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES.args
  }
}
