import React from 'react'
import { Camera, Material, Mesh, Object3D } from 'three'

import { none } from '@etherealengine/hyperflux'

import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  QueryComponents,
  removeComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'

export type Object3DWithEntity = Object3D & { entity: Entity }

export const GroupComponent = defineComponent({
  name: 'GroupComponent',

  onInit: (entity: Entity) => {
    return [] as Object3DWithEntity[]
  },

  onRemove: (entity, component) => {
    for (const obj of component.value) {
      obj.removeFromParent()
      obj.traverse((mesh: Mesh) => {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material: Material) => material.dispose())
        } else {
          mesh.material?.dispose()
        }
        mesh.geometry?.dispose()
      })
    }
  }
})

export function addObjectToGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3DWithEntity & Camera
  obj.entity = entity

  if (!hasComponent(entity, GroupComponent)) addComponent(entity, GroupComponent, [])
  if (getComponent(entity, GroupComponent).includes(obj)) return // console.warn('[addObjectToGroup]: Tried to add an object that is already included', entity, object)
  if (!hasComponent(entity, TransformComponent)) setTransformComponent(entity)

  getMutableComponent(entity, GroupComponent).merge([obj])

  const transform = getComponent(entity, TransformComponent)
  obj.position.copy(transform.position)
  obj.quaternion.copy(transform.rotation)
  obj.scale.copy(transform.scale)
  obj.matrixAutoUpdate = false
  obj.matrixWorldAutoUpdate = false
  obj.matrix = transform.matrix
  obj.matrixWorld = transform.matrix
  obj.matrixWorldInverse = transform.matrixInverse
  if (object !== Engine.instance.scene) Engine.instance.scene.add(object)

  // sometimes it's convenient to update the entity transform via the Object3D,
  // so allow people to do that via proxies
  proxifyVector3WithDirty(TransformComponent.position, entity, TransformComponent.dirtyTransforms, obj.position)
  proxifyQuaternionWithDirty(TransformComponent.rotation, entity, TransformComponent.dirtyTransforms, obj.quaternion)
  proxifyVector3WithDirty(TransformComponent.scale, entity, TransformComponent.dirtyTransforms, obj.scale)
}

export function removeGroupComponent(entity: Entity) {
  if (hasComponent(entity, GroupComponent)) {
    for (const obj of getComponent(entity, GroupComponent)) obj.removeFromParent()
    removeComponent(entity, GroupComponent)
  }
}

export function removeObjectFromGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3DWithEntity & Camera

  if (hasComponent(entity, GroupComponent)) {
    const group = getComponent(entity, GroupComponent)
    if (group.includes(obj)) {
      getMutableComponent(entity, GroupComponent)[group.indexOf(obj)].set(none)
    }
    if (!group.length) removeComponent(entity, GroupComponent)
  }

  object.removeFromParent()
}

export const SCENE_COMPONENT_GROUP = 'group'

export type GroupReactorProps = {
  entity: Entity
  obj: Object3DWithEntity
}

export const startGroupQueryReactor = (
  GroupChildReactor: React.FC<GroupReactorProps>,
  Components: QueryComponents = []
) =>
  startQueryReactor([GroupComponent, ...Components], function GroupQueryReactor(props) {
    const entity = props.root.entity
    const groupComponent = useComponent(entity, GroupComponent)
    return (
      <>
        {groupComponent.value.map((obj, i) => (
          <GroupChildReactor key={obj.uuid} entity={entity} obj={obj} />
        ))}
      </>
    )
  })
