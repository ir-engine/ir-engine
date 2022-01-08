import { AmbientLight, PerspectiveCamera } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { createAvatarController } from '../../avatar/functions/createAvatar'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../camera/types/CameraMode'
import { delay } from '../../common/functions/delay'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { EngineActionType, EngineActions } from '../../ecs/classes/EngineService'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PortalEffect } from '../classes/PortalEffect'
import { Object3DComponent } from '../components/Object3DComponent'
import { PortalComponent } from '../components/PortalComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from './setObjectLayers'

export const teleportToScene = async (
  portalComponent: ReturnType<typeof PortalComponent.get>,
  handleNewScene: () => Promise<void>
) => {
  Engine.currentWorld!.isInPortal = true
  dispatchLocal(EngineActions.enableScene({ physics: false }) as any)
  Engine.hasJoinedWorld = false

  const world = useWorld()

  switchCameraMode(world.localClientEntity, { cameraMode: CameraMode.ShoulderCam }, true)

  // remove controller since physics world will be destroyed and we don't want it moving
  // world.physics.removeController(getComponent(world.localClientEntity, AvatarControllerComponent).controller)

  removeComponent(world.localClientEntity, AvatarControllerComponent)
  removeComponent(world.localClientEntity, InteractorComponent)
  removeComponent(world.localClientEntity, LocalInputTagComponent)

  const playerObj = getComponent(world.localClientEntity, Object3DComponent)
  const texture = await AssetLoader.loadAsync({ url: '/hdr/galaxyTexture.jpg' })

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  hyperspaceEffect.position.copy(playerObj.value.position)
  hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Render, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)
  Engine.scene.add(light)

  Engine.scene.add(hyperspaceEffect)

  // TODO add an ECS thing somewhere to update this properly
  const { delta } = world
  const camera = Engine.scene.getObjectByProperty('isPerspectiveCamera', true as any) as PerspectiveCamera
  camera.zoom = 1.5
  const hyperSpaceUpdateInterval = setInterval(() => {
    hyperspaceEffect.update(delta)

    hyperspaceEffect.position.copy(playerObj.value.position)
    hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

    if (camera.zoom > 0.75) {
      camera.zoom -= delta
      camera.updateProjectionMatrix()
    }
  }, delta * 1000)

  Engine.scene.background = null
  Engine.camera.layers.enable(ObjectLayers.Portal)
  Engine.camera.layers.enable(ObjectLayers.Avatar)
  Engine.camera.layers.disable(ObjectLayers.Scene)

  setObjectLayers(playerObj.value, ObjectLayers.Render, ObjectLayers.Avatar)

  // TODO: add BPCEM of old and new scenes and fade them in and out too
  await hyperspaceEffect.fadeIn(delta)

  await unloadScene()
  await handleNewScene()

  await new Promise((resolve) => {
    Engine.hasJoinedWorld = true
    receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, resolve)
    dispatchLocal(EngineActions.enableScene({ physics: true }) as any)
  })

  await delay(100)

  // teleport player to where the portal is
  const transform = getComponent(world.localClientEntity, TransformComponent)
  transform.position.set(
    portalComponent.remoteSpawnPosition.x,
    portalComponent.remoteSpawnPosition.y,
    portalComponent.remoteSpawnPosition.z
  )

  // const avatar = getComponent(world.localClientEntity, AvatarComponent)
  // rotateViewVectorXZ(avatar.viewVector, portalComponent.remoteSpawnEuler.y)

  createAvatarController(world.localClientEntity)
  addComponent(world.localClientEntity, LocalInputTagComponent, {})

  await delay(250)

  Engine.camera.layers.enable(ObjectLayers.Scene)
  light.removeFromParent()
  light.dispose()

  await hyperspaceEffect.fadeOut(delta)

  setObjectLayers(playerObj.value, ObjectLayers.Render, ObjectLayers.Scene)

  Engine.camera.layers.disable(ObjectLayers.Portal)
  Engine.camera.layers.disable(ObjectLayers.Avatar)

  hyperspaceEffect.removeFromParent()

  clearInterval(hyperSpaceUpdateInterval)

  Engine.currentWorld!.isInPortal = false
}
