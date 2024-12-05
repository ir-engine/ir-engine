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
import { MeshPhysicalMaterial, SphereGeometry } from 'three'

import { defineComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { DebugMeshComponent } from '@ir-engine/spatial/src/common/debug/DebugMeshComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

const sphereGeometry = new SphereGeometry(0.75)
const helperMeshMaterial = new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })

export const EnvMapBakeComponent = defineComponent({
  name: 'EnvMapBakeComponent',
  jsonID: 'EE_envmapbake',

  schema: S.Object({
    bakePosition: T.Vec3(),
    bakePositionOffset: T.Vec3(),
    bakeScale: T.Vec3({ x: 1, y: 1, z: 1 }),
    bakeType: S.Enum(EnvMapBakeTypes, EnvMapBakeTypes.Baked),
    resolution: S.Number(1024),
    refreshMode: S.Enum(EnvMapBakeRefreshTypes, EnvMapBakeRefreshTypes.OnAwake),
    envMapOrigin: S.String(''),
    boxProjection: S.Bool(true)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)

    useLayoutEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, DebugMeshComponent, {
          name: 'envmap-bake-helper',
          geometry: sphereGeometry,
          material: helperMeshMaterial
        })
      }

      return () => {
        removeComponent(entity, DebugMeshComponent)
      }
    }, [debugEnabled])

    return null
  }
})
