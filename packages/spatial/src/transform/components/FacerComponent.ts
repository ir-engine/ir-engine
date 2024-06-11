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

import { EntityUUID, defineComponent } from '@etherealengine/ecs'
import { matches } from '@etherealengine/hyperflux'
export const FacerComponent = defineComponent({
  name: 'FacerComponent',
  jsonID: 'IR_facer',
  onInit: (entity) => ({
    target: null as EntityUUID | null,
    axes: {
      x: true,
      y: true
    }
  }),
  onSet: (entity, component, props) => {
    if (matches.string.test(props?.target)) {
      component.target.set(props.target)
    }
    if (matches.object.test(props?.axes)) {
      if (matches.boolean.test(props.axes.x)) {
        component.axes.x.set(props.axes.x)
      }
      if (matches.boolean.test(props.axes.y)) {
        component.axes.y.set(props.axes.y)
      }
    }
  },
  toJSON: (entity, component) => ({
    target: component.target.value,
    axes: {
      x: component.axes.x.value,
      y: component.axes.y.value
    }
  })
})
