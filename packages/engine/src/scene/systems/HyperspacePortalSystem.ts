import { AmbientLight, Color } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { PortalEffects } from '../functions/loaders/PortalFunctions'
import { setObjectLayers } from '../functions/setObjectLayers'

/** @todo namespace this somehow */
export const HyperspacePortalEffect = 'Hyperspace'

PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)

const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])
const hyperspaceTagComponent = defineQuery([HyperspaceTagComponent])

export default async function HyperspacePortalSystem(world: World) {
  const texture = await AssetLoader.loadAsync('/hdr/galaxyTexture.jpg')

  const transition = createTransitionState(0.25, 'OUT')

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)

  let sceneVisible = true

  const execute = () => {
    if (isNaN(world.localClientEntity)) return

    const playerTransform = getComponent(world.localClientEntity, TransformComponent)
    const sceneLoaded = !sceneAssetPendingTagQuery().length

    // to trigger the hyperspace effect, add the hyperspace tag to the world entity
    for (const entity of hyperspaceTagComponent.enter()) {
      // TODO: add BPCEM of old and new scenes and fade them in and out too
      transition.setState('IN')

      hyperspaceEffect.position.copy(playerTransform.position)
      hyperspaceEffect.quaternion.copy(playerTransform.rotation)
      Engine.instance.currentWorld.camera.zoom = 1.5

      Engine.instance.currentWorld.scene.add(light)
      Engine.instance.currentWorld.scene.add(hyperspaceEffect)
    }

    for (const entity of hyperspaceTagComponent()) {
      if (sceneLoaded && transition.alpha >= 1 && transition.state === 'IN') {
        transition.setState('OUT')
      }

      transition.update(world.deltaSeconds, (opacity) => {
        hyperspaceEffect.update(world.deltaSeconds)
        hyperspaceEffect.tubeMaterial.opacity = opacity

        if (transition.state === 'IN' && opacity >= 1 && sceneVisible) {
          /**
           * hide scene, render just the hyperspace effect and avatar
           */
          Engine.instance.currentWorld.scene.background = new Color('black')
          Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Portal)
          Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Scene)
          sceneVisible = false
        }

        if (sceneLoaded && transition.state === 'OUT' && opacity <= 0) {
          sceneVisible = true
          removeComponent(world.localClientEntity, HyperspaceTagComponent)
          hyperspaceEffect.removeFromParent()
          light.removeFromParent()
          light.dispose()
          Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Portal)
          Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Scene)
        }
      })

      hyperspaceEffect.position.copy(playerTransform.position)
      hyperspaceEffect.quaternion.copy(playerTransform.rotation)

      if (Engine.instance.currentWorld.camera.zoom > 0.75) {
        Engine.instance.currentWorld.camera.zoom -= world.deltaSeconds
        Engine.instance.currentWorld.camera.updateProjectionMatrix()
      }
    }
  }

  const cleanup = async () => {
    PortalEffects.delete(HyperspacePortalEffect)
    removeQuery(world, sceneAssetPendingTagQuery)
    removeQuery(world, hyperspaceTagComponent)
  }

  return { execute, cleanup }
}
