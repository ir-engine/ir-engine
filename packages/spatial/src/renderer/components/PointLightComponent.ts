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
import { Color, DoubleSide, IcosahedronGeometry, Mesh, MeshBasicMaterial, PointLight } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { defineComponent, setComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { useObj } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { matches } from '@etherealengine/hyperflux'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { NameComponent } from '../../common/NameComponent'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { isMobileXRHeadset } from '../../xr/XRState'
import { RendererState } from '../RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { setObjectLayers } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

export const PointLightComponent = defineComponent({
  name: 'PointLightComponent',
  jsonID: 'EE_point_light',

  onInit: (entity) => {
    return {
      color: new Color(),
      intensity: 1,
      range: 0,
      decay: 2,
      castShadow: false,
      shadowBias: 0.5,
      shadowRadius: 1,
      helperEntity: null as Entity | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.color) && json.color.isColor) component.color.set(json.color)
    if (matches.string.test(json.color) || matches.number.test(json.color)) component.color.value.set(json.color)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
    if (matches.number.test(json.range)) component.range.set(json.range)
    if (matches.number.test(json.decay)) component.decay.set(json.decay)
    if (matches.boolean.test(json.castShadow)) component.castShadow.set(json.castShadow)
    /** backwards compat */
    if (matches.number.test(json.shadowBias)) component.shadowBias.set(json.shadowBias)
    if (matches.number.test(json.shadowRadius)) component.shadowRadius.set(json.shadowRadius)
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      intensity: component.intensity.value,
      range: component.range.value,
      decay: component.decay.value,
      castShadow: component.castShadow.value,
      shadowBias: component.shadowBias.value,
      shadowRadius: component.shadowRadius.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useHookstate(getMutableState(RendererState))
    const debugEnabled = renderState.nodeHelperVisibility
    const pointLightComponent = useComponent(entity, PointLightComponent)
    const [light] = useObj(PointLight, entity)

    useEffect(() => {
      if (isMobileXRHeadset) return
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(pointLightComponent.color.value)
    }, [pointLightComponent.color])

    useEffect(() => {
      light.intensity = pointLightComponent.intensity.value
    }, [pointLightComponent.intensity])

    useEffect(() => {
      light.distance = pointLightComponent.range.value
    }, [pointLightComponent.range])

    useEffect(() => {
      light.decay = pointLightComponent.decay.value
    }, [pointLightComponent.decay])

    useEffect(() => {
      light.castShadow = pointLightComponent.castShadow.value
    }, [pointLightComponent.castShadow])

    useEffect(() => {
      light.shadow.bias = pointLightComponent.shadowBias.value
    }, [pointLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = pointLightComponent.shadowRadius.value
    }, [pointLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.set(renderState.shadowMapResolution.value, renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (!debugEnabled.value) return

      const helper = new Mesh(
        mergeBufferGeometries([new IcosahedronGeometry(0.25), new IcosahedronGeometry(0.15)])!,
        new MeshBasicMaterial({ fog: false, transparent: true, opacity: 0.5, side: DoubleSide })
      )
      helper.name = `pointlight-helper-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)

      setObjectLayers(helper, ObjectLayers.NodeHelper)

      pointLightComponent.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        pointLightComponent.helperEntity.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
