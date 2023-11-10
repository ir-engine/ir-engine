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

import { Color, DoubleSide, Mesh, MeshBasicMaterial, SphereGeometry, Texture } from 'three'

import { defineActionQueue, defineState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { setVisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { CameraActions } from '../CameraState'
import { CameraSystem } from './CameraSystem'

const fadeToBlackQueue = defineActionQueue(CameraActions.fadeToBlack.matches)

const CameraFadeBlackEffectSystemState = defineState({
  name: 'CameraFadeBlackEffectSystemState',
  initial: () => {
    const geometry = new SphereGeometry(10)
    const material = new MeshBasicMaterial({
      transparent: true,
      side: DoubleSide,
      depthWrite: true,
      depthTest: false
    })

    const mesh = new Mesh(geometry, material)
    mesh.scale.set(-1, 1, -1)
    mesh.renderOrder = 1
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
  for (const action of fadeToBlackQueue()) {
    transition.setState(action.in ? 'IN' : 'OUT')
    if (action.in) {
      setComputedTransformComponent(entity, Engine.instance.cameraEntity, () => {
        getComponent(entity, TransformComponent).position.copy(
          getComponent(Engine.instance.cameraEntity, TransformComponent).position
        )
      })
    } else removeComponent(entity, ComputedTransformComponent)
    if (action.graphicTexture) {
      AssetLoader.load(action.graphicTexture, {}, (texture: Texture) => {
        mesh.material.color = new Color('white')
        mesh.material.map = texture
        mesh.material.needsUpdate = true
      })
    } else {
      mesh.material.color = new Color('black')
      mesh.material.map = null
      mesh.material.needsUpdate = true
    }
  }

  const deltaSeconds = getState(EngineState).deltaSeconds
  transition.update(deltaSeconds, (alpha) => {
    mesh.material.opacity = alpha
    setVisibleComponent(entity, alpha > 0)
  })
}

export const CameraFadeBlackEffectSystem = defineSystem({
  uuid: 'ee.engine.CameraFadeBlackEffectSystem',
  insert: { with: CameraSystem },
  execute
})
