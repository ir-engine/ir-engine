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
import { BufferGeometry, Color, DirectionalLight, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { RendererState } from '../../renderer/RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { NameComponent } from './NameComponent'
import { setVisibleComponent } from './VisibleComponent'

const material = new LineBasicMaterial()
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

type DirectionalLightHelper = {
  lightPlane: LineSegments<BufferGeometry, LineBasicMaterial>
  targetLine: LineSegments<BufferGeometry, LineBasicMaterial>
  name: string
  size: number
  lightHelperEntity: Entity
}

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',
  jsonID: 'directional-light',

  onInit: (entity) => {
    const light = new DirectionalLight()
    light.target.position.set(0, 0, 1)
    light.target.name = 'light-target'
    light.shadow.camera.near = 0.01
    light.shadow.camera.updateProjectionMatrix()
    return {
      light,
      color: new Color(),
      intensity: 1,
      castShadow: false,
      shadowBias: -0.00001,
      shadowRadius: 1,
      cameraFar: 200,
      useInCSM: true,
      helper: null as DirectionalLightHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.color) && json.color.isColor) component.color.set(json.color)
    if (matches.string.test(json.color) || matches.number.test(json.color)) component.color.value.set(json.color)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
    if (matches.number.test(json.cameraFar)) component.cameraFar.set(json.cameraFar)
    if (matches.boolean.test(json.castShadow)) component.castShadow.set(json.castShadow)
    /** backwards compat */
    if (matches.number.test(json.shadowBias)) component.shadowBias.set(json.shadowBias)
    if (matches.number.test(json.shadowRadius)) component.shadowRadius.set(json.shadowRadius)
    if (matches.boolean.test(json.useInCSM)) component.useInCSM.set(json.useInCSM)

    if (matches.object.test(json.helper)) component.helper.set(json.helper)
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      intensity: component.intensity.value,
      cameraFar: component.cameraFar.value,
      castShadow: component.castShadow.value,
      shadowBias: component.shadowBias.value,
      shadowRadius: component.shadowRadius.value,
      useInCSM: component.useInCSM.value,
      helper: component.helper.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useHookstate(getMutableState(RendererState))
    const debugEnabled = renderState.nodeHelperVisibility
    const light = useComponent(entity, DirectionalLightComponent)

    useEffect(() => {
      addObjectToGroup(entity, light.light.value)
      return () => {
        removeObjectFromGroup(entity, light.light.value)
      }
    }, [])

    useEffect(() => {
      light.light.value.color.set(light.color.value)
      if (light.helper.value) {
        const helper = light.helper.value
        if (light.color.value) {
          helper.lightPlane.material.color.set(light.color.value)
          helper.targetLine.material.color.set(light.color.value)
        } else {
          helper.lightPlane.material.color.copy(light.light!.color.value)
          helper.targetLine.material.color.copy(light.light!.color.value)
        }
      }
    }, [light.color, light.helper])

    useEffect(() => {
      light.light.value.intensity = light.intensity.value
    }, [light.intensity])

    useEffect(() => {
      light.light.value.castShadow = light.castShadow.value && renderState.csm.value?.sourceLight !== light.light.value
    }, [light.castShadow, renderState.csm])

    useEffect(() => {
      light.light.value.shadow.camera.far = light.cameraFar.value
      light.light.shadow.camera.value.updateProjectionMatrix()
    }, [light.cameraFar])

    useEffect(() => {
      light.light.value.shadow.bias = light.shadowBias.value
    }, [light.shadowBias])

    useEffect(() => {
      light.light.value.shadow.radius = light.shadowRadius.value
    }, [light.shadowRadius])

    useEffect(() => {
      if (light.light.value.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.light.value.shadow.mapSize.setScalar(renderState.shadowMapResolution.value)
        light.light.value.shadow.map?.dispose()
        light.light.value.shadow.map = null as any
        light.light.value.shadow.camera.updateProjectionMatrix()
        light.light.value.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (!debugEnabled.value) return

      if (!light.helper.value) {
        const size = 1
        const name = `directional-light-helper-${entity}`

        const lightHelperEntity = createEntity()
        const lightPlane = new LineSegments(lightPlaneGeometry, material)
        setComponent(lightHelperEntity, NameComponent, name)
        addObjectToGroup(lightHelperEntity, lightPlane)
        setComponent(lightHelperEntity, EntityTreeComponent, { parentEntity: entity })
        setVisibleComponent(lightHelperEntity, true)

        const targetLine = new LineSegments(targetLineGeometry, material)
        addObjectToGroup(lightHelperEntity, targetLine)
        targetLine.layers.set(ObjectLayers.NodeHelper)

        light.helper.set({
          lightPlane: lightPlane,
          targetLine: targetLine,
          name: name,
          size: size,
          lightHelperEntity: lightHelperEntity
        })
      }

      return () => {
        if (light.helper.value) {
          const helper = light.helper.value
          removeEntity(helper.lightHelperEntity)
          helper.lightPlane.geometry.dispose()
          helper.lightPlane.material.dispose()
          helper.targetLine.geometry.dispose()
          helper.targetLine.material.dispose()
        }
      }
    }, [debugEnabled])

    return null
  }
})
