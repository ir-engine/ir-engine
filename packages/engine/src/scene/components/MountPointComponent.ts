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

import { useEffect } from 'react'
import { Vector3 } from 'three'

import { getMutableState, matches, useHookstate } from '@etherealengine/hyperflux'

import { defineComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { ArrowHelperComponent } from '@etherealengine/spatial/src/common/debug/ArrowHelperComponent'
import { matchesVector3 } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = (typeof MountPoint)[keyof typeof MountPoint]

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',
  jsonID: 'EE_mount_point',

  onInit: (entity) => {
    return {
      type: MountPoint.seat as MountPointTypes,
      dismountOffset: new Vector3(0, 0, 0.75)
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.string.test(json.type)) component.type.set(json.type)
    if (matchesVector3.test(json.dismountOffset)) component.dismountOffset.set(json.dismountOffset)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      dismountOffset: component.dismountOffset.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)

    useEffect(() => {
      if (!debugEnabled.value) {
        removeComponent(entity, ArrowHelperComponent)
      } else {
        setComponent(entity, ArrowHelperComponent, { name: 'mount-point-helper' })
      }
    }, [debugEnabled])

    return null
  }
})
