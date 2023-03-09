import { AmbientLight, Color } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
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

export default async function HyperspacePortalSystem() {
  PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)

  const transition = createTransitionState(0.25, 'OUT')

  const hyperspaceEffect = new PortalEffect()
  AssetLoader.loadAsync('/hdr/galaxyTexture.jpg').then((texture) => {
    hyperspaceEffect.texture = texture
  })
  hyperspaceEffect.scale.set(10, 10, 10)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)

  let sceneVisible = true

  const execute = () => {
    if (!Engine.instance.localClientEntity) return

    const playerTransform = getOptionalComponent(Engine.instance.localClientEntity, TransformComponent)
    const sceneLoaded = !sceneAssetPendingTagQuery().length

    if (!playerTransform) return

    // to trigger the hyperspace effect, add the hyperspace tag to the world entity
    for (const entity of hyperspaceTagComponent.enter()) {
      // TODO: add BPCEM of old and new scenes and fade them in and out too
      transition.setState('IN')

      hyperspaceEffect.position.copy(playerTransform.position)
      hyperspaceEffect.quaternion.copy(playerTransform.rotation)
      Engine.instance.camera.zoom = 1.5

      Engine.instance.scene.add(light)
      Engine.instance.scene.add(hyperspaceEffect)
    }

    for (const entity of hyperspaceTagComponent()) {
      if (sceneLoaded && transition.alpha >= 1 && transition.state === 'IN') {
        transition.setState('OUT')
      }

      transition.update(Engine.instance.deltaSeconds, (opacity) => {
        hyperspaceEffect.update(Engine.instance.deltaSeconds)
        hyperspaceEffect.tubeMaterial.opacity = opacity

        if (transition.state === 'IN' && opacity >= 1 && sceneVisible) {
          /**
           * hide scene, render just the hyperspace effect and avatar
           */
          Engine.instance.scene.background = new Color('black')
          Engine.instance.camera.layers.enable(ObjectLayers.Portal)
          Engine.instance.camera.layers.disable(ObjectLayers.Scene)
          sceneVisible = false
        }

        if (sceneLoaded && transition.state === 'OUT' && opacity <= 0) {
          sceneVisible = true
          removeComponent(Engine.instance.localClientEntity, HyperspaceTagComponent)
          hyperspaceEffect.removeFromParent()
          light.removeFromParent()
          light.dispose()
          Engine.instance.camera.layers.disable(ObjectLayers.Portal)
          Engine.instance.camera.layers.enable(ObjectLayers.Scene)
        }
      })

      hyperspaceEffect.position.copy(playerTransform.position)
      hyperspaceEffect.quaternion.copy(playerTransform.rotation)

      if (Engine.instance.camera.zoom > 0.75) {
        Engine.instance.camera.zoom -= Engine.instance.deltaSeconds
        Engine.instance.camera.updateProjectionMatrix()
      }
    }
  }

  const cleanup = async () => {
    PortalEffects.delete(HyperspacePortalEffect)
    removeQuery(sceneAssetPendingTagQuery)
    removeQuery(hyperspaceTagComponent)
  }

  return { execute, cleanup }
}
