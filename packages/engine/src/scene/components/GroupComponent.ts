import { BufferGeometry, Camera, Material, Mesh, Object3D } from 'three'

import {
  proxifyQuaternion,
  proxifyQuaternionWithDirty,
  proxifyVector3,
  proxifyVector3WithDirty
} from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from './Object3DComponent'

export type Object3DWithEntity = Object3D & { entity: Entity }

export const GroupComponent = defineComponent({
  name: 'GroupComponent',

  onAdd: (entity: Entity) => {
    return [] as Object3DWithEntity[]
  },

  onRemove: (entity, component) => {
    for (const obj of component) {
      obj.removeFromParent()
      obj.traverse((mesh: Mesh<BufferGeometry, Material>) => {
        mesh.material?.dispose()
        mesh.geometry?.dispose()
      })
    }
  },

  toJSON: (entity, component) => {
    return component
  }
})

export function addObjectToGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3DWithEntity & Camera
  obj.entity = entity

  setComponent(entity, Object3DComponent, { value: obj }) // backwards-compat
  if (!hasComponent(entity, GroupComponent)) addComponent(entity, GroupComponent, [])
  if (!hasComponent(entity, TransformComponent)) setTransformComponent(entity)

  getComponent(entity, GroupComponent).push(obj)

  const transform = getComponent(entity, TransformComponent)
  const world = Engine.instance.currentWorld
  obj.position.copy(transform.position)
  obj.quaternion.copy(transform.rotation)
  obj.scale.copy(transform.scale)
  obj.matrixAutoUpdate = false
  obj.matrix = transform.matrix
  obj.matrixWorld = transform.matrix
  obj.matrixWorldInverse = transform.matrixInverse
  if (object !== Engine.instance.currentWorld.scene) Engine.instance.currentWorld.scene.add(object)

  // sometimes it's convenient to update the entity transform via the Object3D,
  // so allow people to do that via proxies
  proxifyVector3WithDirty(TransformComponent.position, entity, world.dirtyTransforms, obj.position)
  proxifyQuaternionWithDirty(TransformComponent.rotation, entity, world.dirtyTransforms, obj.quaternion)
  proxifyVector3WithDirty(TransformComponent.scale, entity, world.dirtyTransforms, obj.scale)
}

export function removeGroupComponent(entity: Entity) {
  if (hasComponent(entity, Object3DComponent)) removeComponent(entity, Object3DComponent)
  if (hasComponent(entity, GroupComponent)) {
    for (const obj of getComponent(entity, GroupComponent)) obj.removeFromParent()
    removeComponent(entity, GroupComponent)
  }
}

export function removeObjectFromGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3DWithEntity & Camera

  if (hasComponent(entity, Object3DComponent) && getComponent(entity, Object3DComponent).value === obj)
    removeComponent(entity, Object3DComponent)

  if (hasComponent(entity, GroupComponent)) {
    const group = getComponent(entity, GroupComponent)
    if (group.includes(obj)) group.splice(group.indexOf(obj), 1)
    if (!group.length) removeComponent(entity, GroupComponent)
  }

  object.removeFromParent()
}

export const SCENE_COMPONENT_GROUP = 'group'
