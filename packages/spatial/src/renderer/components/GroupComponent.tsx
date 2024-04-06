/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { FC, memo } from 'react'
import { Camera, Mesh, Object3D } from 'three'

import { getState, none } from '@etherealengine/hyperflux'

import { UUIDComponent } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity, EntityUUID } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { QueryComponents, QueryReactor } from '@etherealengine/ecs/src/QueryFunctions'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { MaterialLibraryState } from '@etherealengine/engine/src/scene/materials/MaterialLibrary'
import { MaterialComponent } from '@etherealengine/engine/src/scene/materials/components/MaterialComponent'
import { SourceType } from '@etherealengine/engine/src/scene/materials/components/MaterialSource'
import {
  hashMaterial,
  registerMaterial,
  registerMaterialInstance
} from '@etherealengine/engine/src/scene/materials/functions/MaterialLibraryFunctions'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Layer } from './ObjectLayerComponent'
import { RenderOrderComponent } from './RenderOrderComponent'

export type Object3DWithEntity = Object3D & { entity: Entity }

export const GroupComponent = defineComponent({
  name: 'GroupComponent',

  onInit: (entity: Entity) => {
    return [] as Object3D[]
  },

  onRemove: (entity, component) => {
    for (const obj of component.value) {
      if (obj.parent) {
        obj.removeFromParent()
      }
    }
  }
})

export function addObjectToGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3D & Camera
  obj.entity = entity

  if (!hasComponent(entity, GroupComponent)) setComponent(entity, GroupComponent, [])
  if (getComponent(entity, GroupComponent).includes(obj))
    return console.warn('[addObjectToGroup]: Tried to add an object that is already included', entity, object)
  if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)

  getMutableComponent(entity, GroupComponent).merge([obj])

  const transform = getComponent(entity, TransformComponent)
  obj.position.copy(transform.position)
  obj.quaternion.copy(transform.rotation)
  obj.scale.copy(transform.scale)
  obj.matrixAutoUpdate = false
  obj.matrixWorldAutoUpdate = false
  obj.matrix = transform.matrix
  obj.matrixWorld = transform.matrixWorld
  obj.layers = new Layer(entity)

  obj.frustumCulled = false

  if (!hasComponent(entity, RenderOrderComponent)) setComponent(entity, RenderOrderComponent, obj.renderOrder)
  Object.defineProperty(obj, 'renderOrder', {
    get: () => RenderOrderComponent.renderOrder[entity],
    set: (val: number) => setComponent(entity, RenderOrderComponent, val)
  })

  Object.assign(obj, {
    updateWorldMatrix: () => {}
  })

  Engine.instance.scene.add(obj)

  // sometimes it's convenient to update the entity transform via the Object3D,
  // so allow people to do that via proxies
  proxifyVector3WithDirty(TransformComponent.position, entity, TransformComponent.dirtyTransforms, obj.position)
  proxifyQuaternionWithDirty(TransformComponent.rotation, entity, TransformComponent.dirtyTransforms, obj.quaternion)
  proxifyVector3WithDirty(TransformComponent.scale, entity, TransformComponent.dirtyTransforms, obj.scale)

  if (!(object as Mesh).material) return
  const material = (object as Mesh).material
  const materialLibrary = getState(MaterialLibraryState)
  const materials = Array.isArray(material) ? material : [material]
  materials
    .filter((material) => !materialLibrary.materials[material.uuid])
    .map((material) => {
      const path = getOptionalComponent(entity, SourceComponent)?.slice(37) ?? ''
      //if we already have a unique material hash, we don't need to register it again, reuse the existing one
      const entityFromHash = MaterialComponent.materialByHash[hashMaterial(path, material.name)]
      if (entityFromHash) {
        const materialComponent = getOptionalMutableComponent(entity, MaterialComponent)
        if (!materialComponent) setComponent(entity, MaterialComponent, { uuid: [entityFromHash] })
        else materialComponent.uuid.set([...materialComponent.uuid.value, entityFromHash])
        return
      }
      if (!UUIDComponent.getEntityByUUID(material.uuid as EntityUUID)) {
        if (material.plugins) {
          material.customProgramCacheKey = () =>
            material.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
        }
        const materialComponent = registerMaterial(material, {
          type: SourceType.BUILT_IN,
          path
        })
        material.userData?.plugins && materialComponent.plugins.set(material.userData['plugins'])
      }
      registerMaterialInstance(material, entity)
    })
}

export function removeGroupComponent(entity: Entity) {
  if (hasComponent(entity, GroupComponent)) {
    for (const obj of getComponent(entity, GroupComponent)) obj.removeFromParent()
    removeComponent(entity, GroupComponent)
  }
}

export function removeObjectFromGroup(entity: Entity, object: Object3D) {
  const obj = object as Object3D & Camera

  if (hasComponent(entity, GroupComponent)) {
    const group = getComponent(entity, GroupComponent)
    if (group.includes(obj)) {
      getMutableComponent(entity, GroupComponent)[group.indexOf(obj)].set(none)
    }
    if (!group.length) removeComponent(entity, GroupComponent)
  }

  object.removeFromParent()
}

export type GroupReactorProps = {
  entity: Entity
  obj: Object3D
}

export const GroupReactor = memo((props: { GroupChildReactor: FC<GroupReactorProps> }) => {
  const entity = useEntityContext()
  const groupComponent = useComponent(entity, GroupComponent)
  return (
    <>
      {groupComponent.value.map((obj, i) => (
        <props.GroupChildReactor key={obj.uuid} entity={entity} obj={obj} />
      ))}
    </>
  )
})

export const GroupQueryReactor = memo(
  (props: { GroupChildReactor: FC<GroupReactorProps>; Components?: QueryComponents }) => {
    return (
      <QueryReactor
        Components={[GroupComponent, ...(props.Components ?? [])]}
        ChildEntityReactor={() => <GroupReactor GroupChildReactor={props.GroupChildReactor} />}
      />
    )
  }
)
