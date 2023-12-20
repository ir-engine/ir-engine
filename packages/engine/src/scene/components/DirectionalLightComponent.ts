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
import { Color, DirectionalLight } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent, setComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { RendererState } from '../../renderer/RendererState'
import EditorDirectionalLightHelper from '../classes/EditorDirectionalLightHelper'
import { ObjectLayers } from '../constants/ObjectLayers'
import { GroupComponent, addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { NameComponent } from './NameComponent'
import { ObjectLayerComponent } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

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
      helperEntity: null as Entity | null
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

    /**
     * we need to put this here in case the CSM needs to grab the values, which can sometimes happen before the component reactor hooks
     * @todo find a better way of doing this
     */
    component.light.value.color.set(component.color.value)
    component.light.value.intensity = component.intensity.value
    component.light.value.castShadow = component.castShadow.value
    component.light.value.shadow.camera.far = component.cameraFar.value
    component.light.value.shadow.bias = component.shadowBias.value
    component.light.value.shadow.radius = component.shadowRadius.value
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      intensity: component.intensity.value,
      cameraFar: component.cameraFar.value,
      castShadow: component.castShadow.value,
      shadowBias: component.shadowBias.value,
      shadowRadius: component.shadowRadius.value,
      useInCSM: component.useInCSM.value
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
      const helperEntity = light.helperEntity.value!
      if (helperEntity) {
        const helper = getComponent(helperEntity, GroupComponent)[0] as any as EditorDirectionalLightHelper
        if (light.color.value) {
          helper.lightPlane.material.color.set(light.color.value)
          helper.targetLine.material.color.set(light.color.value)
        } else {
          helper.lightPlane.material.color.copy(helper.directionalLight!.color)
          helper.targetLine.material.color.copy(helper.directionalLight!.color)
        }
      }
    }, [light.color])

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

      const helper = new EditorDirectionalLightHelper(light.light.value)
      helper.name = `directional-light-helper-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)

      setComponent(helperEntity, ObjectLayerComponent, ObjectLayers.NodeHelper)

      light.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        light.helperEntity.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
