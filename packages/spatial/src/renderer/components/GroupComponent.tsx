/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import '../../threejsPatches'

import React, { FC, memo, useEffect, useLayoutEffect } from 'react'
import { Camera, Object3D } from 'three'

import {
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { QueryComponents, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { NO_PROXY, none } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Layer } from './ObjectLayerComponent'
import { VisibleComponent } from './VisibleComponent'

export type Object3DWithEntity = Object3D & { entity: Entity }

export const GroupComponent = defineComponent({
  name: 'GroupComponent',
  schema: S.Array(S.Type<Object3D>()),

  reactor: () => {
    const entity = useEntityContext()
    const groupComponent = useComponent(entity, GroupComponent)

    useEffect(() => {
      setCallback(entity, 'setVisible', () => {
        setComponent(entity, VisibleComponent, true)
      })

      setCallback(entity, 'setInvisible', () => {
        removeComponent(entity, VisibleComponent)
      })

      return () => {
        removeCallback(entity, 'setVisible')
        removeCallback(entity, 'setInvisible')
      }
    }, [])

    useLayoutEffect(() => {
      const group = groupComponent.get(NO_PROXY)
      return () => {
        if (!hasComponent(entity, GroupComponent)) for (const obj of group) obj.removeFromParent()
      }
    }, [groupComponent])

    return null
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

  Object.assign(obj, {
    updateWorldMatrix: () => {}
  })

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
  const obj = object as Object3D & Camera

  if (hasComponent(entity, GroupComponent)) {
    const group = getComponent(entity, GroupComponent)
    if (group.includes(obj)) {
      getMutableComponent(entity, GroupComponent)[group.indexOf(obj)].set(none)
    }
    if (!group.length) removeComponent(entity, GroupComponent)
  }

  if (object.parent) object.removeFromParent()
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
        <props.GroupChildReactor key={obj.uuid} entity={entity} obj={obj as Object3D} />
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
