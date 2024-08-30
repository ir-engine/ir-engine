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

import { useEffect } from 'react'

import { defineComponent, hasComponent, removeComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { CallbackComponent, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

export const SceneDynamicLoadTagComponent = defineComponent({
  name: 'SceneDynamicLoadTagComponent',
  jsonID: 'EE_dynamic_load',

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

  toJSON: (component) => {
    return {
      mode: component.mode,
      distance: component.distance,
      loaded: component.loaded
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
