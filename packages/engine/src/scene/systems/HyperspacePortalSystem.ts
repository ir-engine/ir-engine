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
import { AmbientLight, Vector3 } from 'three'

import config from '@etherealengine/common/src/config'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/Axis3D'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { PortalComponent, PortalEffects } from '../components/PortalComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

/** @todo namespace this somehow */
export const HyperspacePortalEffect = 'Hyperspace'

const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])
const hyperspaceTagComponent = defineQuery([HyperspaceTagComponent])

let sceneVisible = true

const hyperspaceEffect = new PortalEffect()
hyperspaceEffect.scale.set(10, 10, 10)

const light = new AmbientLight('#aaa')
light.layers.enable(ObjectLayers.Portal)

const HyperspacePortalSystemState = defineState({
  name: 'HyperspacePortalSystemState',
  initial: () => {
    return {
      transition: null! as ReturnType<typeof createTransitionState>
    }
  }
})

const execute = () => {
  if (!Engine.instance.localClientEntity) return

  const engineState = getState(EngineState)

  const { transition } = getState(HyperspacePortalSystemState)

  const playerTransform = getOptionalComponent(Engine.instance.localClientEntity, TransformComponent)
  const sceneLoaded = !sceneAssetPendingTagQuery().length

  if (!playerTransform) return
  const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)

  // to trigger the hyperspace effect, add the hyperspace tag to the world entity
  for (const entity of hyperspaceTagComponent.enter()) {
    // TODO: add BPCEM of old and new scenes and fade them in and out too
    transition.setState('IN')
    camera.layers.enable(ObjectLayers.Portal)

    camera.zoom = 1.5

    Engine.instance.scene.add(light)
    Engine.instance.scene.add(hyperspaceEffect)

    hyperspaceEffect.quaternion.setFromUnitVectors(
      ObjectDirection.Forward,
      new Vector3(0, 0, 1).applyQuaternion(cameraTransform.rotation).setY(0).normalize()
    )
  }

  for (const entity of hyperspaceTagComponent()) {
    if (sceneLoaded && transition.alpha >= 1 && transition.state === 'IN') {
      transition.setState('OUT')
      camera.layers.enable(ObjectLayers.Scene)
    }

    transition.update(engineState.deltaSeconds, (opacity) => {
      hyperspaceEffect.update(engineState.deltaSeconds)
      hyperspaceEffect.tubeMaterial.opacity = opacity

      if (transition.state === 'IN' && opacity >= 1 && sceneVisible) {
        /**
         * hide scene, render just the hyperspace effect and avatar
         */
        const activePortal = getComponent(Engine.instance.activePortalEntity, PortalComponent)
        teleportAvatar(Engine.instance.localClientEntity, activePortal!.remoteSpawnPosition, true)
        camera.layers.disable(ObjectLayers.Scene)
        sceneVisible = false
      }

      if (sceneLoaded && transition.state === 'OUT' && opacity <= 0) {
        sceneVisible = true
        removeComponent(Engine.instance.localClientEntity, HyperspaceTagComponent)
        hyperspaceEffect.removeFromParent()
        light.removeFromParent()
        camera.layers.disable(ObjectLayers.Portal)
      }
    })

    hyperspaceEffect.position.copy(cameraTransform.position)
    hyperspaceEffect.updateMatrixWorld(true)

    if (camera.zoom > 0.75) {
      camera.zoom -= engineState.deltaSeconds
      camera.updateProjectionMatrix()
    }
  }
}

const reactor = () => {
  useEffect(() => {
    PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)

    const transition = createTransitionState(0.5, 'OUT')
    setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

    getMutableState(HyperspacePortalSystemState).set({
      transition
    })

    AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/assets/galaxyTexture.jpg`).then(
      (texture) => {
        hyperspaceEffect.texture = texture
      }
    )

    return () => {
      PortalEffects.delete(HyperspacePortalEffect)
      getMutableState(HyperspacePortalSystemState).set({ transition: null! })
    }
  }, [])
  return null
}

export const HyperspacePortalSystem = defineSystem({
  uuid: 'ee.engine.HyperspacePortalSystem',
  execute,
  reactor
})
