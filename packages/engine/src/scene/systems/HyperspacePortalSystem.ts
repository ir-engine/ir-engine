import { AmbientLight, Color } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { PortalEffects } from '../functions/loaders/PortalFunctions'
import { setObjectLayers } from '../functions/setObjectLayers'

/** @todo namespace this somehow */
export const HyperspacePortalEffect = 'Hyperspace'

PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)

export default async function HyperspacePortalSystem(world: World) {
  const hyperspaceTagComponent = defineQuery([HyperspaceTagComponent])
  const texture = await AssetLoader.loadAsync('/hdr/galaxyTexture.jpg')

  const transition = createTransitionState(0.25, 'IN')

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)

  let sceneVisible = true

  return () => {
    const playerObj = getComponent(world.localClientEntity, Object3DComponent)

    // to trigger the hyperspace effect, add the hyperspace tag to the world entity
    for (const entity of hyperspaceTagComponent.enter()) {
      // TODO: add BPCEM of old and new scenes and fade them in and out too
      transition.setState('IN')

      hyperspaceEffect.position.copy(playerObj.value.position)
      hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)
      Engine.instance.currentWorld.camera.zoom = 1.5

      Engine.instance.currentWorld.scene.add(light)
      Engine.instance.currentWorld.scene.add(hyperspaceEffect)

      // create receptor for joining the world to end the hyperspace effect
      matchActionOnce(EngineActions.sceneLoaded.matches, () => {
        transition.setState('OUT')
        return true
      })
    }

    // run the logic for
    for (const entity of hyperspaceTagComponent()) {
      transition.update(world.fixedTick, (opacity) => {
        hyperspaceEffect.update(world.deltaSeconds)
        hyperspaceEffect.tubeMaterial.opacity = opacity

        if (opacity === 1 && sceneVisible) {
          /**
           * hide scene, render just the hyperspace effect and avatar
           */
          Engine.instance.currentWorld.scene.background = new Color('black')
          Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Portal)
          Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Scene)
          sceneVisible = false
        }

        if (opacity === 0) {
          sceneVisible = true
          removeComponent(world.sceneEntity, HyperspaceTagComponent)
          hyperspaceEffect.removeFromParent()
          light.removeFromParent()
          light.dispose()
          Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Portal)
        }
      })

      hyperspaceEffect.position.copy(playerObj.value.position)
      hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

      if (Engine.instance.currentWorld.camera.zoom > 0.75) {
        Engine.instance.currentWorld.camera.zoom -= world.deltaSeconds
        Engine.instance.currentWorld.camera.updateProjectionMatrix()
      }
    }
  }
}
