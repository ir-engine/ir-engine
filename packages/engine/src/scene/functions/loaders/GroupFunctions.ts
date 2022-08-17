import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_GROUP = 'group'
export const SCENE_COMPONENT_GROUP_DEFAULT_VALUES = {}

export const deserializeGroup: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson<{}>) => {
  addComponent(entity, GroupComponent, {})
  addComponent(entity, Object3DComponent, { value: new Object3D() })
}

export const serializeGroup: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, GroupComponent)) {
    return {
      name: SCENE_COMPONENT_GROUP,
      props: {}
    }
  }
}
