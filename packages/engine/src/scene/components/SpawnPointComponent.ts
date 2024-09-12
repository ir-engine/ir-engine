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

import { useLayoutEffect } from 'react'

import { defineComponent, hasComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NO_PROXY, UserID, getMutableState, matches, none, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { useGLTF } from '../../assets/functions/resourceLoaderHooks'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'EE_spawn_point',

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

    const [gltf] = useGLTF(debugEnabled.value ? GLTF_PATH : '', entity)

    useLayoutEffect(() => {
      const scene = gltf?.scene
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
        if (!hasComponent(entity, SpawnPointComponent)) return
        spawnPoint.helperEntity.set(none)
      }
    }, [gltf, debugEnabled])

    return null
  }
})
