import { BufferGeometry, Material, Mesh, Object3D } from 'three'

import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, defineComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
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
  const obj = object as Object3DWithEntity
  obj.entity = entity

  if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: obj })
  if (!hasComponent(entity, GroupComponent)) addComponent(entity, GroupComponent, [])

  getComponent(entity, GroupComponent).push(obj)

  if (!hasComponent(entity, TransformComponent)) setTransformComponent(entity, obj.position, obj.quaternion, obj.scale)

  const world = Engine.instance.currentWorld
  const transform = getComponent(entity, TransformComponent)
  obj.matrixAutoUpdate = false
  obj.position.copy(transform.position)
  obj.quaternion.copy(transform.rotation)
  obj.scale.copy(transform.scale)
  proxifyVector3(TransformComponent.position, entity, world.dirtyTransforms, obj.position)
  proxifyQuaternion(TransformComponent.rotation, entity, world.dirtyTransforms, obj.quaternion)
  proxifyVector3(TransformComponent.scale, entity, world.dirtyTransforms, obj.scale)
  Engine.instance.currentWorld.scene.add(object)
}

export const SCENE_COMPONENT_GROUP = 'group'
