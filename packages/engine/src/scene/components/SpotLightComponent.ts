import { useEffect } from 'react'
import { Color, ConeGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D, SpotLight, TorusGeometry } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { RendererState } from '../../renderer/RendererState'
import { isHeadset } from '../../xr/XRState'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const SpotLightComponent = defineComponent({
  name: 'SpotLightComponent',

  onInit: (entity) => {
    const light = new SpotLight()
    light.target.position.set(0, -1, 0)
    light.target.name = 'light-target'
    light.add(light.target)
    if (!isHeadset()) addObjectToGroup(entity, light)
    return {
      color: new Color(),
      intensity: 10,
      range: 0,
      decay: 2,
      angle: Math.PI / 3,
      penumbra: 1,
      castShadow: false,
      shadowMapResolution: 256,
      shadowBias: 0.00001,
      shadowRadius: 1,
      light,
      helper: null as Object3D | null,
      helperCone: null as Mesh<ConeGeometry, MeshBasicMaterial> | null,
      helperRing: null as Mesh<TorusGeometry, MeshBasicMaterial> | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.color) && json.color.isColor) component.color.set(json.color)
    if (matches.string.test(json.color)) component.color.value.set(json.color)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
    if (matches.number.test(json.range)) component.range.set(json.range)
    if (matches.number.test(json.decay)) component.decay.set(json.decay)
    if (matches.number.test(json.angle)) component.angle.set(json.angle)
    if (matches.number.test(json.penumbra)) component.angle.set(json.penumbra)
    if (matches.boolean.test(json.castShadow)) component.castShadow.set(json.castShadow)
    /** backwards compat */
    if (matches.array.test(json.shadowMapResolution))
      component.shadowMapResolution.set((json.shadowMapResolution as any)[0])
    if (matches.number.test(json.shadowMapResolution)) component.shadowMapResolution.set(json.shadowMapResolution)
    if (matches.number.test(json.shadowBias)) component.shadowBias.set(json.shadowBias)
    if (matches.number.test(json.shadowRadius)) component.shadowRadius.set(json.shadowRadius)
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value.getHex(),
      intensity: component.intensity.value,
      range: component.range.value,
      decay: component.decay.value,
      angle: component.angle.value,
      penumbra: component.penumbra.value,
      castShadow: component.castShadow.value,
      shadowMapResolution: component.shadowMapResolution.value,
      shadowBias: component.shadowBias.value,
      shadowRadius: component.shadowRadius.value
    }
  },

  onRemove: (entity, component) => {
    if (component.light.value) removeObjectFromGroup(entity, component.light.value)
    if (component.helper.value) removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, SpotLightComponent)) throw root.stop()

    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const light = useComponent(root.entity, SpotLightComponent)

    useEffect(() => {
      light.light.value.color.set(light.color.value)
      if (light.helperCone.value) light.helperCone.value.material.color = light.color.value
      if (light.helperRing.value) light.helperRing.value.material.color = light.color.value
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
      light.light.value.angle = light.angle.value
    }, [light.angle])

    useEffect(() => {
      light.light.value.penumbra = light.penumbra.value
    }, [light.penumbra])

    useEffect(() => {
      light.light.value.shadow.bias = light.shadowBias.value
    }, [light.shadowBias])

    useEffect(() => {
      light.light.value.shadow.radius = light.shadowRadius.value
    }, [light.shadowRadius])

    useEffect(() => {
      light.light.value.castShadow = light.castShadow.value
    }, [light.castShadow])

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
        const helper = new Object3D()
        helper.name = `spotlight-helper-${root.entity}`

        const ring = new Mesh(new TorusGeometry(0.1, 0.025, 8, 12), new MeshBasicMaterial({ fog: false }))
        const cone = new Mesh(
          new ConeGeometry(0.25, 0.5, 8, 1, true),
          new MeshBasicMaterial({ fog: false, transparent: true, opacity: 0.5, side: DoubleSide })
        )
        helper.add(ring, cone)

        ring.rotateX(Math.PI / 2)
        cone.position.setY(-0.25)

        setObjectLayers(helper, ObjectLayers.NodeHelper)

        addObjectToGroup(root.entity, helper)
        light.helper.set(helper)
        light.helperRing.set(ring)
        light.helperCone.set(cone)
      }

      if (!debugEnabled.value && light.helper.value) {
        removeObjectFromGroup(root.entity, light.helper.value)
        light.helper.set(none)
      }
    }, [debugEnabled])

    return null
  }
})

export const SCENE_COMPONENT_SPOT_LIGHT = 'spot-light'
