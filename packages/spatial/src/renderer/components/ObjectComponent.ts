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

import { Object3D } from 'three'

import {
  EntityTreeComponent,
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { useImmediateEffect } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { NameComponent } from '../../common/NameComponent'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Layer } from './ObjectLayerComponent'
import { VisibleComponent } from './VisibleComponent'

declare module 'three/src/core/Object3D' {
  interface Object3D {
    /** @deprecated */
    preserveChildren?: boolean
    /** @deprecated */
    readonly isProxified: true | undefined
  }
}

export type Object3DWithEntity = Object3D & { entity: Entity }

export const ObjectComponent = defineComponent({
  name: 'ObjectComponent',
  jsonID: 'EE_object3d',
  schema: S.Required(S.Type<Object3DWithEntity>()),

  reactor: () => {
    const entity = useEntityContext()

    useImmediateEffect(() => {
      const obj = getComponent(entity, ObjectComponent) as Object3DWithEntity
      setComponent(entity, TransformComponent)

      obj.entity = entity

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

      /** until all three hierarchies are replaced with ECS, we need to preserve this in a few cases  */
      if (!obj.preserveChildren) {
        Object.defineProperties(obj, {
          parent: {
            get() {
              if (ObjectComponent.activeRender) return null // hack to check if renderer is rendering
              if (getOptionalComponent(entity, EntityTreeComponent)?.parentEntity) {
                const result = getOptionalComponent(
                  getComponent(entity, EntityTreeComponent).parentEntity!,
                  ObjectComponent
                )
                return result ?? null
              }
              return null
            },
            set(value) {
              if (value != undefined) throw new Error('Cannot set parent of proxified object')
              console.warn('Setting to nil value is not supported ObjectComponent.ts')
            }
          },
          children: {
            get() {
              if (ObjectComponent.activeRender) return [] // hack to check if renderer is rendering
              if (hasComponent(entity, EntityTreeComponent)) {
                const childEntities = getComponent(entity, EntityTreeComponent).children
                const result: Object3D[] = []
                for (const childEntity of childEntities) {
                  if (hasComponent(childEntity, ObjectComponent)) {
                    result.push(getComponent(childEntity, ObjectComponent))
                  }
                }
                return result
              } else {
                return []
              }
            },
            set(value) {
              if (value != undefined) throw new Error('Cannot set children of proxified object')
              console.warn('Setting to nil value is not supported ObjectComponent.ts')
            }
          },
          isProxified: {
            value: true
          }
        })
        Object.assign(obj, {
          get name() {
            return getOptionalComponent(entity, NameComponent)
          },
          set name(value) {
            if (value != undefined) throw new Error('Cannot set name of proxified object')
          },
          updateWorldMatrix: () => {}
        })
      }

      // sometimes it's convenient to update the entity transform via the Object3D,
      // so allow people to do that via proxies
      proxifyVector3WithDirty(TransformComponent.position, entity, TransformComponent.dirtyTransforms, obj.position)
      proxifyQuaternionWithDirty(
        TransformComponent.rotation,
        entity,
        TransformComponent.dirtyTransforms,
        obj.quaternion
      )
      proxifyVector3WithDirty(TransformComponent.scale, entity, TransformComponent.dirtyTransforms, obj.scale)

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

    return null
  },

  /**
   * @deprecated will be removed once threejs objects are not proxified. Should only be used in ObjectComponent.tsx
   * see https://github.com/ir-engine/ir-engine/issues/9308
   */
  activeRender: false
})

/** @deprecated GroupComponent renamed to ObjectComponent */
export const GroupComponent = ObjectComponent

/** @deprecated use setComponent(entity, ObjectComponent, object) */
export function addObjectToGroup(entity: Entity, object: Object3D) {
  if (hasComponent(entity, ObjectComponent)) {
    if (getComponent(entity, ObjectComponent) === object)
      return console.warn('[addObjectToGroup] Entity already has the object')
    throw new Error('[addObjectToGroup] Entity already has an ObjectComponent')
  }
  setComponent(entity, ObjectComponent, object)
}

/** @deprecated use removeComponent(entity, ObjectComponent) */
export function removeObjectFromGroup(entity: Entity, object: Object3D) {
  removeComponent(entity, ObjectComponent)
}

export type GroupReactorProps = {
  entity: Entity
  obj: Object3D
}
