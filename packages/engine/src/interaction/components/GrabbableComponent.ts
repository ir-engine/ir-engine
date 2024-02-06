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

import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'

/**
 * GrabbableComponent
 * - Allows an entity to be grabbed by a GrabberComponent
 */
export const GrabbableComponent = defineComponent({
  name: 'GrabbableComponent',
  jsonID: 'equippable', // TODO: rename to grabbable
  toJSON: () => true
})

/**
 * GrabbedComponent
 * - Indicates that an entity is currently being grabbed by a GrabberComponent
 */
export const GrabbedComponent = defineComponent({
  name: 'GrabbedComponent',

  onInit(entity) {
    return {
      attachmentPoint: 'none' as XRHandedness,
      grabberEntity: null! as Entity
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.attachmentPoint === 'string') component.attachmentPoint.set(json.attachmentPoint)
    if (typeof json.grabberEntity === 'number') component.grabberEntity.set(json.grabberEntity)
  }
})

/**
 * GrabberComponent
 * - Allows an entity to grab a GrabbableComponent
 */
export const GrabberComponent = defineComponent({
  name: 'GrabberComponent',

  onInit(entity) {
    return {
      left: null as Entity | null,
      right: null as Entity | null
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.left === 'number' || json.left === null) component.left.set(json.left)
    if (typeof json.right === 'number' || json.right === null) component.right.set(json.right)
  }
})
