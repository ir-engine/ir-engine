import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_PREVENT_BAKE = 'prevent-bake'
export const SCENE_COMPONENT_PREVENT_BAKE_DEFAULT_VALUES = {}

export const deserializePreventBake: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  if (Engine.isEditor) {
    addComponent(entity, PreventBakeTagComponent, {})
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_PREVENT_BAKE)
  }
}

export const serializePreventBake: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, PreventBakeTagComponent)) {
    return {
      name: SCENE_COMPONENT_PREVENT_BAKE,
      props: {}
    }
  }
}
