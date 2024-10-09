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

import {
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, none, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { UUIDComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useGLTF } from '../../assets/functions/resourceLoaderHooks'

const GLTF_PATH = '/static/editor/spawn-point.glb'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'EE_spawn_point',

  schema: S.Object({
    permissionedUsers: S.Array(S.UserID()),
    helperEntity: S.Nullable(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const rendererState = useHookstate(getMutableState(RendererState))
    const areNodeHelpersVisible = rendererState.nodeHelperVisibility
    const isEntityHelperVisible = rendererState.selectedEntityUUIDs.value.has(getComponent(entity, UUIDComponent))
    const spawnPoint = useComponent(entity, SpawnPointComponent)

    const [gltf] = useGLTF(areNodeHelpersVisible.value || isEntityHelperVisible ? GLTF_PATH : '', entity)

    useLayoutEffect(() => {
      const scene = gltf?.scene
      if (!scene || !(areNodeHelpersVisible || isEntityHelperVisible)) return

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
    }, [gltf, isEntityHelperVisible, areNodeHelpersVisible])

    return null
  }
})
