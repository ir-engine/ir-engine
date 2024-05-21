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

import { useLayoutEffect } from 'react'
import { MeshPhysicalMaterial, SphereGeometry, Vector3 } from 'three'

import { defineComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, matches, useHookstate } from '@etherealengine/hyperflux'
import { DebugMeshComponent } from '@etherealengine/spatial/src/common/debug/DebugMeshComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'

import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

const sphereGeometry = new SphereGeometry(0.75)
const helperMeshMaterial = new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })

export const EnvMapBakeComponent = defineComponent({
  name: 'EnvMapBakeComponent',
  jsonID: 'EE_envmapbake',

  onInit: (entity) => {
    return {
      bakePosition: new Vector3(),
      bakePositionOffset: new Vector3(),
      bakeScale: new Vector3().set(1, 1, 1),
      bakeType: EnvMapBakeTypes.Baked,
      resolution: 1024,
      refreshMode: EnvMapBakeRefreshTypes.OnAwake,
      envMapOrigin: '',
      boxProjection: true
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.bakePosition)) component.bakePosition.value.copy(json.bakePosition)
    if (matches.object.test(json.bakePositionOffset)) component.bakePositionOffset.value.copy(json.bakePositionOffset)
    if (matches.object.test(json.bakeScale)) component.bakeScale.value.copy(json.bakeScale)
    if (matches.string.test(json.bakeType)) component.bakeType.set(json.bakeType)
    if (matches.number.test(json.resolution)) component.resolution.set(json.resolution)
    if (matches.string.test(json.refreshMode)) component.refreshMode.set(json.refreshMode)
    if (matches.string.test(json.envMapOrigin)) component.envMapOrigin.set(json.envMapOrigin)
    if (matches.boolean.test(json.boxProjection)) component.boxProjection.set(json.boxProjection)
  },

  toJSON: (entity, component) => {
    return {
      bakePosition: component.bakePosition.value,
      bakePositionOffset: component.bakePositionOffset.value,
      bakeScale: component.bakeScale.value,
      bakeType: component.bakeType.value,
      resolution: component.resolution.value,
      refreshMode: component.refreshMode.value,
      envMapOrigin: component.envMapOrigin.value,
      boxProjection: component.boxProjection.value
    }
  },

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
