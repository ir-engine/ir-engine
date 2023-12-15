import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { createState, defineState, getMutableState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Color, Vector3 } from 'three'
import { CameraSystem } from '../../camera/systems/CameraSystem'
import { Engine } from '../../ecs/classes/Engine'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { SDFShader } from '../../renderer/effects/SDFShader'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { setCallback } from './CallbackComponent'
import { UpdatableCallback, UpdatableComponent } from './UpdatableComponent'
export const SDFComponent = defineComponent({
  name: 'SDFComponent',
  jsonID: 'SDF',

  onInit: (entity) => {
    return {
      color: new Color(0xffffff),
      enable: false
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (json.color?.isColor) {
      component.color.set(json.color)
    }
    if (typeof json.enable == 'boolean') {
      component.enable.set(json.enable)
    }
    //if (json.enable) component.enable.set(json.enable)
  },
  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      enable: component.enable.value
    }
  },

  SDFState: createState({
    enabled: false,
    color: new Color(0xf3ffff)
  }),
  SDFStateSettingsState: defineState({
    name: 'SDFSettingsState',
    initial: {
      enabled: true
    }
  }),

  reactor: () => {
    const entity = useEntityContext()
    const sdfComponent = useComponent(entity, SDFComponent)
    const cameraPosition = getComponent(Engine.instance.cameraEntity, TransformComponent).position
    const shader = SDFShader.shader

    const updater = createEntity()
    setCallback(updater, UpdatableCallback, (dt) => {
      shader.uniforms.uTime.value += dt * 0.005
    })

    setComponent(updater, UpdatableComponent, true)

    useExecute(
      () => {
        shader.uniforms.cameraPos.value = cameraPosition
      },
      { after: CameraSystem }
    )

    useEffect(() => {
      getMutableState(SDFComponent.SDFStateSettingsState).enabled.set(sdfComponent.enable.value)
    }, [sdfComponent.enable])

    useEffect(() => {
      shader.uniforms.uColor.value = new Vector3(
        sdfComponent.color.value.r,
        sdfComponent.color.value.g,
        sdfComponent.color.value.b
      )
    }, [sdfComponent.color])
    return null
  }
})
