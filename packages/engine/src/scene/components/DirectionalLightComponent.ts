import { useEffect } from 'react'
import { Color, DirectionalLight, IcosahedronGeometry, Mesh, MeshBasicMaterial, Object3D, Vector2 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import {
  createMappedComponent,
  defineComponent,
  hasComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import EditorDirectionalLightHelper from '../classes/EditorDirectionalLightHelper'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',

  onInit: (entity) => {
    const light = new DirectionalLight()
    light.target.position.set(0, 0, 1)
    light.target.name = 'light-target'
    light.add(light.target)
    addObjectToGroup(entity, light)
    return {
      light,
      color: new Color(),
      intensity: 1,
      castShadow: false,
      shadowMapResolution: 512,
      shadowBias: -0.00001,
      shadowRadius: 1,
      cameraFar: 2000,
      useInCSM: true,
      helper: null as EditorDirectionalLightHelper | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.color) && json.color.isColor) component.color.set(json.color)
    if (matches.string.test(json.color)) component.color.value.set(json.color)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
    if (matches.number.test(json.cameraFar)) component.cameraFar.set(json.cameraFar)
    if (matches.boolean.test(json.castShadow)) component.castShadow.set(json.castShadow)
    /** backwards compat */
    if (matches.array.test(json.shadowMapResolution))
      component.shadowMapResolution.set((json.shadowMapResolution as any)[0])
    if (matches.number.test(json.shadowMapResolution)) component.shadowMapResolution.set(json.shadowMapResolution)
    if (matches.number.test(json.shadowBias)) component.shadowBias.set(json.shadowBias)
    if (matches.number.test(json.shadowRadius)) component.shadowRadius.set(json.shadowRadius)
    if (matches.number.test(json.useInCSM)) component.useInCSM.set(json.useInCSM)
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value.getHex(),
      intensity: component.intensity.value,
      cameraFar: component.cameraFar.value,
      castShadow: component.castShadow.value,
      shadowMapResolution: component.shadowMapResolution.value,
      shadowBias: component.shadowBias.value,
      shadowRadius: component.shadowRadius.value,
      useInCSM: component.useInCSM.value
    }
  },

  onRemove: (entity, component) => {
    if (component.light.value) removeObjectFromGroup(entity, component.light.value)
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, DirectionalLightComponent)) throw root.stop()

    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const light = useComponent(root.entity, DirectionalLightComponent)

    useEffect(() => {
      light.light.value.color.set(light.color.value)
    }, [light.color])

    useEffect(() => {
      light.light.value.intensity = light.intensity.value
    }, [light.intensity])

    useEffect(() => {
      light.light.value.castShadow = light.castShadow.value
    }, [light.castShadow])

    useEffect(() => {
      light.light.value.shadow.camera.far = light.cameraFar.value
    }, [light.cameraFar])

    useEffect(() => {
      light.light.value.shadow.bias = light.shadowBias.value
    }, [light.shadowBias])

    useEffect(() => {
      light.light.value.shadow.radius = light.shadowRadius.value
    }, [light.shadowRadius])

    useEffect(() => {
      if (light.light.value.shadow.mapSize.x !== light.shadowMapResolution.value) {
        light.light.value.shadow.mapSize.set(light.shadowMapResolution.value, light.shadowMapResolution.value)
        light.light.value.shadow.map?.dispose()
        light.light.value.shadow.map = null as any
        light.light.value.shadow.camera.updateProjectionMatrix()
        light.light.value.shadow.needsUpdate = true
      }
    }, [light.shadowMapResolution])

    useEffect(() => {
      if (debugEnabled.value && !light.helper.value) {
        const helper = new EditorDirectionalLightHelper(light.light.value)
        helper.name = `directional-light-helper-${root.entity}`

        // const cameraHelper = new CameraHelper(light.shadow.camera)
        // cameraHelper.visible = false
        // light.userData.cameraHelper = cameraHelper

        setObjectLayers(helper, ObjectLayers.NodeHelper)

        addObjectToGroup(root.entity, helper)
        light.helper.set(helper)
      }

      if (!debugEnabled.value && light.helper.value) {
        removeObjectFromGroup(root.entity, light.helper.value)
        light.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const SCENE_COMPONENT_DIRECTIONAL_LIGHT = 'directional-light'
