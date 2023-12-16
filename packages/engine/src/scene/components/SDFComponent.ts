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

import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Color, Vector3 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraSystem } from '../../camera/systems/CameraSystem'
import { Engine } from '../../ecs/classes/Engine'
import { UndefinedEntity } from '../../ecs/classes/Entity'
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
      scale: new Vector3(0.25, 0.001, 0.25),
      enable: false
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (json.color?.isColor) {
      component.color.set(json.color)
    }
    if (json.scale?.isVector3) {
      component.scale.set(json.scale)
    }
    if (typeof json.enable == 'boolean') {
      component.enable.set(json.enable)
    }
    //if (json.enable) component.enable.set(json.enable)
  },
  toJSON: (entity, component) => {
    return {
      color: component.color.value,
      scale: component.scale.value,
      enable: component.enable.value
    }
  },

  SDFStateSettingsState: defineState({
    name: 'SDFSettingsState',
    initial: {
      enabled: true
    }
  }),

  reactor: () => {
    const entity = useEntityContext()
    const sdfComponent = useComponent(entity, SDFComponent)
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    const cameraPosition = cameraTransform.position
    const shader = SDFShader.shader
    const cameraComponent = getComponent(Engine.instance.cameraEntity, CameraComponent)
    let updater = UndefinedEntity

    useEffect(() => {
      updater = createEntity()
      setCallback(updater, UpdatableCallback, (dt) => {
        shader.uniforms.uTime.value += dt * 0.1
      })
      setComponent(updater, UpdatableComponent, true)
    }, [])

    useExecute(
      () => {
        shader.uniforms.cameraPos.value = cameraPosition
        shader.uniforms.cameraMatrix.value = cameraTransform.matrix
        shader.uniforms.fov.value = cameraComponent.fov
        shader.uniforms.aspectRatio.value = cameraComponent.aspect
      },
      { after: CameraSystem }
    )

    useEffect(() => {
      if (getState(SDFComponent.SDFStateSettingsState).enabled !== sdfComponent.enable.value)
        getMutableState(SDFComponent.SDFStateSettingsState).enabled.set(sdfComponent.enable.value)
    }, [sdfComponent.enable])

    useEffect(() => {
      shader.uniforms.uColor.value = new Vector3(
        sdfComponent.color.value.r,
        sdfComponent.color.value.g,
        sdfComponent.color.value.b
      )
    }, [sdfComponent.color])

    useEffect(() => {
      shader.uniforms.scale.value = sdfComponent.scale.value
    }, [sdfComponent.scale])

    return null
  }
})
