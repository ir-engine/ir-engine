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

import { AxesHelper } from 'three'

import { defineComponent, Entity, useComponent, useEntityContext } from '@etherealengine/ecs'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'

import { useDisposable } from '../../resources/resourceHooks'
import { useHelperEntity } from './DebugComponentUtils'

export const AxesHelperComponent = defineComponent({
  name: 'AxesHelperComponent',

  onInit: (entity) => {
    return {
      name: 'axes-helper',
      size: 1,
      layerMask: ObjectLayerMasks.NodeHelper,
      entity: undefined as undefined | Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.name === 'string') component.name.set(json.name)
    if (typeof json.size === 'number') component.size.set(json.size)
    if (typeof json.layerMask === 'number') component.layerMask.set(json.layerMask)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, AxesHelperComponent)
    const [helper] = useDisposable(AxesHelper, entity, component.size.value)
    useHelperEntity(entity, component, helper, component.layerMask.value)

    return null
  }
})
