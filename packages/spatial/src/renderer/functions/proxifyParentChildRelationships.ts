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

import { getComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs'
import { Object3D } from 'three'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { RendererComponent } from '../WebGLRendererSystem'
import { GroupComponent } from '../components/GroupComponent'
import { MeshComponent } from '../components/MeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'

export const proxifyParentChildRelationships = (obj: Object3D) => {
  const objEntity = obj.entity
  Object.defineProperties(obj, {
    matrixWorld: {
      get() {
        return getComponent(objEntity, TransformComponent).matrixWorld
      },
      set(value) {
        if (value != undefined) throw new Error('Cannot set matrixWorld of proxified object')
        console.warn('Setting to nil value is not supported proxifyParentChildRelationships.ts')
      }
    },
    parent: {
      get() {
        if (RendererComponent.activeRender) return null // hack to check if renderer is rendering
        if (getOptionalComponent(objEntity, EntityTreeComponent)?.parentEntity) {
          const result = getOptionalComponent(
            getComponent(objEntity, EntityTreeComponent).parentEntity!,
            GroupComponent
          )?.[0]
          return result ?? null
        }
        return null
      },
      set(value) {
        if (value != undefined) throw new Error('Cannot set parent of proxified object')
        console.warn('Setting to nil value is not supported proxifyParentChildRelationships.ts')
      }
    },
    children: {
      get() {
        if (RendererComponent.activeRender) return [] // hack to check if renderer is rendering
        if (hasComponent(objEntity, EntityTreeComponent)) {
          const childEntities = getComponent(objEntity, EntityTreeComponent).children
          const result: Object3D[] = []
          for (const childEntity of childEntities) {
            if (hasComponent(childEntity, MeshComponent)) {
              result.push(getComponent(childEntity, MeshComponent))
            } else if (hasComponent(childEntity, Object3DComponent)) {
              result.push(getComponent(childEntity, Object3DComponent))
            }
          }
          return result
        } else {
          return []
        }
      },
      set(value) {
        if (value != undefined) throw new Error('Cannot set children of proxified object')
        console.warn('Setting to nil value is not supported proxifyParentChildRelationships.ts')
      }
    },
    isProxified: {
      value: true
    }
  })
}
