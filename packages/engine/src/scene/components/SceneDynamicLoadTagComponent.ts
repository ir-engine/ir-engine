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

import {
  defineComponent,
  hasComponent,
  removeComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { CallbackComponent, setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { useEffect } from 'react'

export const SceneDynamicLoadTagComponent = defineComponent({
  name: 'SceneDynamicLoadTagComponent',
  jsonID: 'dynamic-load',

  onInit(entity) {
    return {
      mode: 'distance' as 'distance' | 'trigger',
      distance: 20,
      loaded: false
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.mode === 'string') component.mode.set(json.mode)
    if (typeof json.distance === 'number') component.distance.set(json.distance)
    if (typeof json.loaded === 'boolean') component.loaded.set(json.loaded)
  },

  toJSON: (entity, component) => {
    return {
      mode: component.mode.value,
      distance: component.distance.value,
      loaded: component.loaded.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SceneDynamicLoadTagComponent)

    /** Trigger mode */
    useEffect(() => {
      if (component.mode.value !== 'trigger') return

      function doLoad() {
        component.loaded.set(true)
      }

      function doUnload() {
        component.loaded.set(false)
      }

      if (hasComponent(entity, CallbackComponent)) {
        removeComponent(entity, CallbackComponent)
      }

      setCallback(entity, 'doLoad', doLoad)
      setCallback(entity, 'doUnload', doUnload)

      return () => {
        removeComponent(entity, CallbackComponent)
      }
    }, [component.mode])

    return null
  }
})
