import { Group, Object3D } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, defineComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'

export type GroupWithEntity = Group & { entity: Entity }

export const GroupComponent = defineComponent({
  name: 'XRE_group',

  onAdd: (entity: Entity) => {
    const value = new Group() as any as Object3D // TODO: replace w/ as GroupWithEntity
    // @ts-ignore
    value.entity = entity
    return { value }
  },

  onRemove: (entity, component) => {
    component.value.removeFromParent()
  },

  toJSON: () => {
    return {}
  }
})

export function addObjectToGroup(entity: Entity, object: Object3D) {
  if (!hasComponent(entity, GroupComponent)) addComponent(entity, GroupComponent, {})
  getComponent(entity, GroupComponent).value.add(object)
}

export const SCENE_COMPONENT_GROUP = 'group'
