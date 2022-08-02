import { AmbientLight, Euler, Quaternion } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AvatarStates } from '../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../camera/types/CameraMode'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

export default async function HyperspacePortalSystem(world: World) {
  const hyperspaceTagComponent = defineQuery([HyperspaceTagComponent])
  const texture = await AssetLoader.loadAsync('/hdr/galaxyTexture.jpg')

  const transition = createTransitionState(1, 'IN')

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)

  return () => {
    const playerObj = getComponent(world.localClientEntity, Object3DComponent)

    // to trigger the hyperspace effect, add the hyperspace tag to the world entity
    for (const entity of hyperspaceTagComponent.enter()) {
      if (!EngineRenderer.instance.xrSession)
        switchCameraMode(Engine.instance.currentWorld.cameraEntity, { cameraMode: CameraMode.ShoulderCam }, true)

      getComponent(world.localClientEntity, AvatarControllerComponent).movementEnabled = false

      dispatchAction(WorldNetworkAction.avatarAnimation({ newStateName: AvatarStates.FALL_IDLE, params: {} }))

      // TODO: add BPCEM of old and new scenes and fade them in and out too
      transition.setState('IN')

      hyperspaceEffect.position.copy(playerObj.value.position)
      hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)
      Engine.instance.currentWorld.camera.zoom = 1.5

      // set scene to render just the hyperspace effect and avatar
      Engine.instance.currentWorld.scene.background = null
      Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Portal)
      Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Scene)

      Engine.instance.currentWorld.scene.add(light)
      Engine.instance.currentWorld.scene.add(hyperspaceEffect)

      // create receptor for joining the world to end the hyperspace effect
      matchActionOnce(EngineActions.sceneLoaded.matches, () => {
        transition.setState('OUT')
        return true
      })
    }

    // the hyperspace exit runs once the fadeout transition has finished
    for (const entity of hyperspaceTagComponent.exit()) {
      const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
      controller.movementEnabled = true

      // teleport player to where the portal spawn position is
      controller.controller.setTranslation(world.activePortal!.remoteSpawnPosition, true)
      controller.controller.setRotation(
        new Quaternion().setFromEuler(new Euler(0, world.activePortal!.remoteSpawnEuler.y, 0, 'XYZ')),
        true
      )

      world.activePortal = null
      dispatchAction(EngineActions.setTeleporting({ isTeleporting: false }))

      hyperspaceEffect.removeFromParent()

      Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Scene)

      light.removeFromParent()
      light.dispose()

      Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Portal)
    }

    // run the logic for
    for (const entity of hyperspaceTagComponent()) {
      transition.update(world, (opacity) => {
        hyperspaceEffect.update(world.deltaSeconds)
        hyperspaceEffect.tubeMaterial.opacity = opacity

        if (opacity === 0) {
          removeComponent(world.sceneEntity, HyperspaceTagComponent)
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
