import { useEffect } from 'react'
import { AmbientLight, Color, Quaternion, Vector3 } from 'three'

import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { ObjectDirection } from '../../common/constants/Axis3D'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { SceneState } from '../../ecs/classes/Scene'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { PortalEffects } from '../components/PortalComponent'
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
setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

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

  // to trigger the hyperspace effect, add the hyperspace tag to the world entity
  for (const entity of hyperspaceTagComponent.enter()) {
    // TODO: add BPCEM of old and new scenes and fade them in and out too
    transition.setState('IN')
    Engine.instance.camera.layers.enable(ObjectLayers.Portal)

    Engine.instance.camera.zoom = 1.5

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
      Engine.instance.camera.layers.enable(ObjectLayers.Scene)
    }

    transition.update(engineState.deltaSeconds, (opacity) => {
      hyperspaceEffect.update(engineState.deltaSeconds)
      hyperspaceEffect.tubeMaterial.opacity = opacity

      if (transition.state === 'IN' && opacity >= 1 && sceneVisible) {
        /**
         * hide scene, render just the hyperspace effect and avatar
         */
        teleportAvatar(Engine.instance.localClientEntity, Engine.instance.activePortal!.remoteSpawnPosition, true)
        Engine.instance.camera.layers.disable(ObjectLayers.Scene)
        sceneVisible = false
      }

      if (sceneLoaded && transition.state === 'OUT' && opacity <= 0) {
        sceneVisible = true
        removeComponent(Engine.instance.localClientEntity, HyperspaceTagComponent)
        hyperspaceEffect.removeFromParent()
        light.removeFromParent()
        Engine.instance.camera.layers.disable(ObjectLayers.Portal)
      }
    })

    hyperspaceEffect.position.copy(cameraTransform.position)
    hyperspaceEffect.updateMatrixWorld(true)

    if (Engine.instance.camera.zoom > 0.75) {
      Engine.instance.camera.zoom -= engineState.deltaSeconds
      Engine.instance.camera.updateProjectionMatrix()
    }
  }
}

const reactor = () => {
  useEffect(() => {
    PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)

    const transition = createTransitionState(0.5, 'OUT')

    getMutableState(HyperspacePortalSystemState).set({
      transition
    })

    AssetLoader.loadAsync('/hdr/galaxyTexture.jpg').then((texture) => {
      hyperspaceEffect.texture = texture
    })

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
