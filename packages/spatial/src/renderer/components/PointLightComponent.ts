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
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { NameComponent } from '../../common/NameComponent'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { matches } from '../../common/functions/MatchesUtils'
import { isMobileXRHeadset } from '../../xr/XRState'
import { RendererState } from '../RendererState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { setObjectLayers } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

export const PointLightComponent = defineComponent({
  name: 'PointLightComponent',
  jsonID: 'point-light',

  onInit: (entity) => {
    const light = new PointLight()
    return {
      color: new Color(),
      intensity: 1,
      range: 0,
      decay: 2,
      castShadow: false,
      shadowBias: 0.5,
      shadowRadius: 1,
      light,
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
    const light = useComponent(entity, PointLightComponent)
    useEffect(() => {
      if (isMobileXRHeadset) return
      addObjectToGroup(entity, light.light.value)
      return () => {
        removeObjectFromGroup(entity, light.light.value)
      }
    }, [])

    useEffect(() => {
      light.light.value.color.set(light.color.value)
    }, [light.color])

    useEffect(() => {
      light.light.value.intensity = light.intensity.value
    }, [light.intensity])

    useEffect(() => {
      light.light.value.distance = light.range.value
    }, [light.range])

    useEffect(() => {
      light.light.value.decay = light.decay.value
    }, [light.decay])

    useEffect(() => {
      light.light.value.castShadow = light.castShadow.value
    }, [light.castShadow])

    useEffect(() => {
      light.light.value.shadow.bias = light.shadowBias.value
    }, [light.shadowBias])

    useEffect(() => {
      light.light.value.shadow.radius = light.shadowRadius.value
    }, [light.shadowRadius])

    useEffect(() => {
      if (light.light.value.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.light.value.shadow.mapSize.set(
          renderState.shadowMapResolution.value,
          renderState.shadowMapResolution.value
        )
        light.light.value.shadow.map?.dispose()
        light.light.value.shadow.map = null as any
        light.light.value.shadow.camera.updateProjectionMatrix()
        light.light.value.shadow.needsUpdate = true
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

      light.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        light.helperEntity.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
