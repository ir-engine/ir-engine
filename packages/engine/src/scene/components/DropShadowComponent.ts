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

import { Vector3 } from 'three'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { matches } from '@ir-engine/hyperflux'

export const DropShadowComponent = defineComponent({
  name: 'DropShadowComponent',
  onInit: (entity) => {
    return {
      radius: 0,
      center: new Vector3(),
      entity: 0 as Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.center)) component.center.set(json.center)
    if (matches.number.test(json.radius)) component.radius.set(json.radius)
    if (matches.number.test(json.entity)) component.entity.set(json.entity)
  }
})
