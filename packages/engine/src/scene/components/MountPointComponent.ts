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
import { ArrowHelper, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { defineComponent, setComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { matches, matchesVector3 } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = (typeof MountPoint)[keyof typeof MountPoint]

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',
  jsonID: 'mount-point',

  onInit: (entity) => {
    return {
      type: MountPoint.seat as MountPointTypes,
      helperEntity: null as Entity | null,
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
    const mountPoint = useComponent(entity, MountPointComponent)

    useEffect(() => {
      if (!debugEnabled.value) return

      const helper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0xffffff)
      helper.name = `mount-point-helper-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      mountPoint.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        mountPoint.helperEntity.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
