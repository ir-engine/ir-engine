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

import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { NO_PROXY, getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup } from './GroupComponent'
import { NameComponent } from './NameComponent'
import { ObjectLayerComponent } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'spawn-point',

  onInit: (entity) => {
    return {
      permissionedUsers: [] as UserID[],
      helperEntity: null as Entity | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.array.test(json.permissionedUsers)) component.permissionedUsers.set(json.permissionedUsers as any)
  },

  toJSON: (entity, component) => {
    return {
      permissionedUsers: component.permissionedUsers.get(NO_PROXY)
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const spawnPoint = useComponent(entity, SpawnPointComponent)

    useEffect(() => {
      if (!debugEnabled.value) return

      const helperEntity = createEntity()
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)

      spawnPoint.helperEntity.set(helperEntity)

      let active = true
      AssetLoader.loadAsync(GLTF_PATH).then(({ scene: helper }) => {
        if (!active) return
        helper.name = `spawn-point-helper-${entity}`
        addObjectToGroup(helperEntity, helper)
        setComponent(helperEntity, ObjectLayerComponent, { objectLayers: [ObjectLayers.NodeHelper] })
        setComponent(helperEntity, NameComponent, helper.name)
      })

      return () => {
        active = false
        removeEntity(helperEntity)
        spawnPoint.helperEntity.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
