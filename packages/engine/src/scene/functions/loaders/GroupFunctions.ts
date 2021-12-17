import { Object3D } from 'three'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/ComponentNames'
import { GroupComponent } from '../../components/GroupComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_GROUP = 'group'
export const SCENE_COMPONENT_GROUP_DEFAULT_VALUES = {}

export const deserializeGroup: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson) => {
  addComponent(entity, GroupComponent, {})
  addComponent(entity, Object3DComponent, { value: new Object3D() })
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_GROUP)
}

export const serializeGroup: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, GroupComponent)) {
    return {
      name: SCENE_COMPONENT_GROUP,
      props: {}
    }
  }
}
