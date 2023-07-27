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

import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from 'three'

import { defineActionQueue, defineState, getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { setVisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { LocalTransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { CameraActions } from '../CameraState'

const VERTEX_SHADER = 'void main() { vec3 newPosition = position * 2.0; gl_Position = vec4(newPosition, 1.0); }'

const FRAGMENT_SHADER =
  'uniform vec3 color; uniform float intensity; void main() { gl_FragColor = vec4(color, intensity); }'

const fadeActionQueue = defineActionQueue(CameraActions.fadeToBlack.matches)

const CameraFadeBlackEffectSystemState = defineState({
  name: 'CameraFadeBlackEffectSystemState',
  initial: () => {
    const geometry = new PlaneGeometry(1, 1)
    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      uniforms: {
        color: { value: new Color('black') },
        intensity: { value: 0 }
      }
    })
    const mesh = new Mesh(geometry, material)
    mesh.name = 'Camera Fade Transition'
    const entity = createEntity()
    addObjectToGroup(entity, mesh)
    setObjectLayers(mesh, ObjectLayers.Scene)
    const transition = createTransitionState(0.25, 'OUT')

    return {
      transition,
      mesh,
      entity
    }
  }
})

const execute = () => {
  const { transition, mesh, entity } = getState(CameraFadeBlackEffectSystemState)
  for (const action of fadeActionQueue()) {
    transition.setState(action.in ? 'IN' : 'OUT')
    if (action.in)
      setComponent(entity, LocalTransformComponent, {
        parentEntity: Engine.instance.cameraEntity,
        position: new Vector3(0, 0, -0.1)
      })
    else removeComponent(entity, LocalTransformComponent)
  }
  transition.update(Engine.instance.deltaSeconds, (alpha) => {
    mesh.material.uniforms.intensity.value = alpha
    setVisibleComponent(entity, alpha > 0)
  })
}

export const CameraFadeBlackEffectSystem = defineSystem({
  uuid: 'ee.engine.CameraFadeBlackEffectSystem',
  execute
})
