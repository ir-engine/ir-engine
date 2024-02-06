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

import { defineComponent, getComponent, setComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { createEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { SDFSettingsState } from '@etherealengine/spatial/src/renderer/effects/sdf/SDFSettingsState'
import { SDFShader } from '@etherealengine/spatial/src/renderer/effects/sdf/SDFShader'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import { Color, Vector3 } from 'three'
import { UpdatableCallback, UpdatableComponent } from './UpdatableComponent'

export enum SDFMode {
  TORUS,
  BOX,
  SPHERE,
  FOG
}

export const SDFComponent = defineComponent({
  name: 'SDFComponent',
  jsonID: 'SDF',

  onInit: (entity) => {
    return {
      color: new Color(0xffffff),
      scale: new Vector3(0.25, 0.001, 0.25),
      enable: false,
      mode: SDFMode.TORUS
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (json.color?.isColor) {
      component.color.set(json.color)
    }
    if (typeof json.enable === 'boolean') {
      component.enable.set(json.enable)
    }
    if (typeof json.mode === 'number') {
      component.mode.set(json.mode)
    }
    if (typeof json.scale === 'number') {
      component.scale.set(json.scale)
    }
  },
  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      enable: component.enable.value,
      scale: component.scale.value,
      mode: component.mode.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const sdfComponent = useComponent(entity, SDFComponent)

    useEffect(() => {
      const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
      const cameraPosition = cameraTransform.position
      const transformComponent = getComponent(entity, TransformComponent)
      const cameraComponent = getComponent(Engine.instance.cameraEntity, CameraComponent)
      const updater = createEntity()
      setCallback(updater, UpdatableCallback, (dt) => {
        SDFShader.shader.uniforms.uTime.value += dt * 0.1
      })

      SDFShader.shader.uniforms.cameraMatrix.value = cameraTransform.matrix
      SDFShader.shader.uniforms.fov.value = cameraComponent.fov
      SDFShader.shader.uniforms.aspectRatio.value = cameraComponent.aspect
      SDFShader.shader.uniforms.near.value = cameraComponent.near
      SDFShader.shader.uniforms.far.value = cameraComponent.far
      SDFShader.shader.uniforms.sdfMatrix.value = transformComponent.matrixWorld
      SDFShader.shader.uniforms.cameraPos.value = cameraPosition
      setComponent(updater, UpdatableComponent, true)
    }, [])

    useEffect(() => {
      getMutableState(SDFSettingsState).enabled.set(sdfComponent.enable.value)
    }, [sdfComponent.enable])

    useEffect(() => {
      SDFShader.shader.uniforms.uColor.value = new Vector3(
        sdfComponent.color.value.r,
        sdfComponent.color.value.g,
        sdfComponent.color.value.b
      )
    }, [sdfComponent.color])

    useEffect(() => {
      SDFShader.shader.uniforms.scale.value = sdfComponent.scale.value
    }, [sdfComponent.scale])

    useEffect(() => {
      SDFShader.shader.uniforms.mode.value = sdfComponent.mode.value
    }, [sdfComponent.mode])

    return null
  }
})
