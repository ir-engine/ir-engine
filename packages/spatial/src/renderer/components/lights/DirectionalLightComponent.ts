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
import { BufferGeometry, DirectionalLight, Float32BufferAttribute } from 'three'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { mergeBufferGeometries } from '../../../common/classes/BufferGeometryUtils'
import { useDisposable } from '../../../resources/resourceHooks'
import { T } from '../../../schema/schemaFunctions'
import { RendererState } from '../../RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LineSegmentComponent } from '../LineSegmentComponent'
import { LightTagComponent } from './LightTagComponent'

const size = 1
const lightPlaneGeometry = new BufferGeometry()
lightPlaneGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(
    [
      -size,
      size,
      0,
      size,
      size,
      0,
      size,
      size,
      0,
      size,
      -size,
      0,
      size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      -size,
      0,
      -size,
      size,
      0,
      -size,
      size,
      0,
      size,
      -size,
      0,
      size,
      size,
      0,
      -size,
      -size,
      0
    ],
    3
  )
)

const targetLineGeometry = new BufferGeometry()
const t = size * 0.1
targetLineGeometry.setAttribute(
  'position',
  new Float32BufferAttribute([-t, t, 0, 0, 0, 1, t, t, 0, 0, 0, 1, t, -t, 0, 0, 0, 1, -t, -t, 0, 0, 0, 1], 3)
)

const mergedGeometry = mergeBufferGeometries([targetLineGeometry, lightPlaneGeometry])

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',
  jsonID: 'EE_directional_light',

  schema: S.Object({
    light: S.NonSerialized(S.Type<DirectionalLight>()),
    color: T.Color(),
    intensity: S.Number(1),
    castShadow: S.Bool(false),
    shadowBias: S.Number(-0.00001),
    shadowRadius: S.Number(1),
    cameraFar: S.Number(200)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const directionalLightComponent = useComponent(entity, DirectionalLightComponent)
    const [light] = useDisposable(DirectionalLight, entity)
    const lightHelper = useOptionalComponent(entity, LineSegmentComponent)

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      directionalLightComponent.light.set(light)
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(directionalLightComponent.color.value)
      if (!lightHelper) return
      lightHelper.color.set(directionalLightComponent.color.value)
    }, [directionalLightComponent.color])

    useEffect(() => {
      light.intensity = directionalLightComponent.intensity.value
    }, [directionalLightComponent.intensity])

    useEffect(() => {
      light.shadow.camera.far = directionalLightComponent.cameraFar.value
      light.shadow.camera.updateProjectionMatrix()
    }, [directionalLightComponent.cameraFar])

    useEffect(() => {
      light.shadow.bias = directionalLightComponent.shadowBias.value
    }, [directionalLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = directionalLightComponent.shadowRadius.value
    }, [directionalLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.setScalar(renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, LineSegmentComponent, {
          name: 'directional-light-helper',
          // Clone geometry because LineSegmentComponent disposes it when removed
          geometry: mergedGeometry?.clone(),
          color: directionalLightComponent.color.value
        })

        return () => {
          removeComponent(entity, LineSegmentComponent)
        }
      }
    }, [debugEnabled])

    return null
  }
})
