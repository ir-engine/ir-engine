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

import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'

import { ComponentJsonType, EntityJsonType } from '../types/SceneTypes'

const oldColliderJSONID = 'collider'
const oldModelJSONID = 'EE_model'

/**
 * Converts old ColliderComponent to RigidbodyComponent, new ColliderComponent and TriggerComponent
 */
export const migrateOldColliders = (oldJSON: EntityJsonType) => {
  /** models need to be manually converted in the studio */
  const hasModel = Object.values(oldJSON.components).some((comp) => comp.name === oldModelJSONID)
  if (hasModel) return

  const newComponents = [] as ComponentJsonType[]
  for (const component of oldJSON.components) {
    if (component.name !== oldColliderJSONID) continue

    const data = component.props
    newComponents.push({
      name: RigidBodyComponent.jsonID,
      props: {
        type:
          data.bodyType === 1 || data.bodyType === 'Fixed'
            ? 'fixed'
            : data.bodyType === 0 || data.bodyType === 'Dynamic'
            ? 'dynamic'
            : 'kinematic'
      }
    })
    if (typeof data.shapeType === 'number')
      newComponents.push({
        name: ColliderComponent.jsonID,
        props: {
          shape: data.shapeType,
          collisionLayer: data.collisionLayer,
          collisionMask: data.collisionMask,
          restitution: data.restitution
        }
      })
    if (data.isTrigger) {
      newComponents.push({
        name: TriggerComponent.jsonID,
        props: { triggers: data.triggers }
      })
    }
  }

  if (!newComponents.length) return

  oldJSON.components.push(...newComponents)
  oldJSON.components = oldJSON.components.filter((component) => component.name !== oldColliderJSONID)
}
