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
import { Color, DirectionalLight, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  defineQuery,
  getComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { RendererState } from '../../renderer/RendererState'
import { TransformSystem } from '../../transform/systems/TransformSystem'
import EditorDirectionalLightHelper from '../classes/EditorDirectionalLightHelper'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { GroupComponent, addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { NameComponent } from './NameComponent'
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
      /** @deprecated CSM uses primary camera set in renderer settings [#9580](https://github.com/EtherealEngine/etherealengine/issues/9580) */
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

    const light = component.light.value
    light.color.copy(component.color.value)
    light.intensity = component.intensity.value
    light.castShadow = component.castShadow.value
    light.shadow.bias = component.shadowBias.value
    light.shadow.radius = component.shadowRadius.value
    light.shadow.camera.far = component.cameraFar.value
    light.shadow.camera.updateProjectionMatrix()
    light.shadow.needsUpdate = true
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
    const directionalLightComponent = useComponent(entity, DirectionalLightComponent)

    useEffect(() => {
      addObjectToGroup(entity, directionalLightComponent.light.value)
      return () => {
        removeObjectFromGroup(entity, directionalLightComponent.light.value)
      }
    }, [])

    useEffect(() => {
      directionalLightComponent.light.value.color.set(directionalLightComponent.color.value)
      const helperEntity = directionalLightComponent.helperEntity.value!
      if (helperEntity) {
        const helper = getComponent(helperEntity, GroupComponent)[0] as any as EditorDirectionalLightHelper
        if (directionalLightComponent.color.value) {
          helper.lightPlane.material.color.set(directionalLightComponent.color.value)
          helper.targetLine.material.color.set(directionalLightComponent.color.value)
        } else {
          helper.lightPlane.material.color.copy(helper.directionalLight!.color)
          helper.targetLine.material.color.copy(helper.directionalLight!.color)
        }
      }
    }, [directionalLightComponent.color])

    useEffect(() => {
      directionalLightComponent.light.value.intensity = directionalLightComponent.intensity.value
    }, [directionalLightComponent.intensity])

    useEffect(() => {
      directionalLightComponent.light.value.castShadow =
        directionalLightComponent.castShadow.value &&
        renderState.csm.value?.sourceLight !== directionalLightComponent.light.value
    }, [directionalLightComponent.castShadow, renderState.csm])

    useEffect(() => {
      directionalLightComponent.light.value.shadow.camera.far = directionalLightComponent.cameraFar.value
      directionalLightComponent.light.shadow.camera.value.updateProjectionMatrix()
    }, [directionalLightComponent.cameraFar])

    useEffect(() => {
      directionalLightComponent.light.value.shadow.bias = directionalLightComponent.shadowBias.value
    }, [directionalLightComponent.shadowBias])

    useEffect(() => {
      directionalLightComponent.light.value.shadow.radius = directionalLightComponent.shadowRadius.value
    }, [directionalLightComponent.shadowRadius])

    useEffect(() => {
      if (directionalLightComponent.light.value.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        directionalLightComponent.light.value.shadow.mapSize.setScalar(renderState.shadowMapResolution.value)
        directionalLightComponent.light.value.shadow.map?.dispose()
        directionalLightComponent.light.value.shadow.map = null as any
        directionalLightComponent.light.value.shadow.camera.updateProjectionMatrix()
        directionalLightComponent.light.value.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (!debugEnabled.value) return

      const helper = new EditorDirectionalLightHelper(directionalLightComponent.light.value)
      helper.name = `directional-light-helper-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)

      setObjectLayers(helper, ObjectLayers.NodeHelper)

      directionalLightComponent.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        directionalLightComponent.helperEntity.set(none)
      }
    }, [debugEnabled])

    useExecute(
      () => {
        const light = directionalLightComponent.light.value
        light.getWorldDirection(_vec3)
        light.getWorldPosition(light.target.position).add(_vec3)
        light.target.updateMatrixWorld()
      },
      { after: TransformSystem }
    )

    return null
  }
})

const _vec3 = new Vector3()

export const DirectionalLightQuery = defineQuery([DirectionalLightComponent])
