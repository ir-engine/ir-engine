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

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { NO_PROXY, getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { defineComponent, setComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { matches } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useGLTF } from '../../assets/functions/resourceHooks'

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

    const [gltf, unload] = useGLTF(debugEnabled.value ? GLTF_PATH : '', entity)

    // Only call unload when unmounted
    useEffect(() => {
      return unload
    }, [])

    useEffect(() => {
      const scene = gltf.get(NO_PROXY)?.scene
      if (!scene || !debugEnabled.value) return

      const helperEntity = createEntity()
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      spawnPoint.helperEntity.set(helperEntity)

      scene.name = `spawn-point-helper-${entity}`
      addObjectToGroup(helperEntity, scene)
      setObjectLayers(scene, ObjectLayers.NodeHelper)
      setComponent(helperEntity, NameComponent, scene.name)

      setVisibleComponent(spawnPoint.helperEntity.value!, true)

      return () => {
        removeObjectFromGroup(helperEntity, scene)
        removeEntity(helperEntity)
        spawnPoint.helperEntity.set(none)
      }
    }, [gltf, debugEnabled])

    return null
  }
})
