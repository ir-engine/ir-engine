import { AmbientLight, Euler } from 'three'

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
import { NetworkTopics } from '../../networking/classes/Network'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

export default async function HyperspacePortalSystem(world: World) {
  const hyperspaceTagComponent = defineQuery([HyperspaceTagComponent])
  const texture = await AssetLoader.loadAsync('/hdr/galaxyTexture.jpg')

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)

  return () => {
    const { deltaSeconds: delta } = world

    const playerObj = getComponent(world.localClientEntity, Object3DComponent)

    // to trigger the hyperspace effect, add the hyperspace tag to the world entity
    for (const entity of hyperspaceTagComponent.enter()) {
      if (!EngineRenderer.instance.xrSession)
        switchCameraMode(Engine.instance.currentWorld.cameraEntity, { cameraMode: CameraMode.ShoulderCam }, true)

      getComponent(world.localClientEntity, AvatarControllerComponent).movementEnabled = false

      dispatchAction(
        WorldNetworkAction.avatarAnimation({ newStateName: AvatarStates.FALL_IDLE, params: {} }),
        NetworkTopics.world
      )

      // TODO: add BPCEM of old and new scenes and fade them in and out too
      hyperspaceEffect.fadeIn(delta)

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
        hyperspaceEffect.fadeOut(delta).then(() => {
          removeComponent(world.worldEntity, HyperspaceTagComponent)
        })
        return true
      })
    }

    // the hyperspace exit runs once the fadeout transition has finished
    for (const entity of hyperspaceTagComponent.exit()) {
      getComponent(world.localClientEntity, AvatarControllerComponent).movementEnabled = true

      // teleport player to where the portal spawn position is
      const { position, rotation } = getComponent(world.localClientEntity, TransformComponent)
      position.copy(world.activePortal.remoteSpawnPosition)
      rotation.setFromEuler(new Euler(0, world.activePortal.remoteSpawnEuler.y, 0, 'XYZ'))

      hyperspaceEffect.removeFromParent()

      Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.Scene)

      light.removeFromParent()
      light.dispose()

      Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.Portal)
    }

    // run the logic for
    for (const entity of hyperspaceTagComponent()) {
      hyperspaceEffect.update(delta)

      hyperspaceEffect.position.copy(playerObj.value.position)
      hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

      if (Engine.instance.currentWorld.camera.zoom > 0.75) {
        Engine.instance.currentWorld.camera.zoom -= delta
        Engine.instance.currentWorld.camera.updateProjectionMatrix()
      }
    }
  }
}
