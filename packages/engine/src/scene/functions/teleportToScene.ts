import { AmbientLight, PerspectiveCamera, Vector3 } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CameraLayers } from '../../camera/constants/CameraLayers'
import { rotateViewVectorXZ } from '../../camera/systems/CameraSystem'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PortalComponent } from '../components/PortalComponent'
import { PortalEffect } from '../classes/PortalEffect'
import { Object3DComponent } from '../components/Object3DComponent'
import { delay } from '../../common/functions/delay'
import { PhysXInstance } from 'three-physx'
import { createAvatarController } from '../../avatar/functions/createAvatar'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { World } from '../../ecs/classes/World'
import { processLocationChange } from '../../ecs/functions/EngineFunctions'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../camera/types/CameraMode'

export const teleportToScene = async (
  portalComponent: ReturnType<typeof PortalComponent.get>,
  handleNewScene: () => void
) => {
  World.defaultWorld.isInPortal = true
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: false })
  Engine.hasJoinedWorld = false

  switchCameraMode(Network.instance.localClientEntity, { cameraMode: CameraMode.ShoulderCam }, true)

  // remove controller since physics world will be destroyed and we don't want it moving
  PhysXInstance.instance.removeController(
    getComponent(Network.instance.localClientEntity, AvatarControllerComponent).controller
  )
  removeComponent(Network.instance.localClientEntity, AvatarControllerComponent)
  removeComponent(Network.instance.localClientEntity, InteractorComponent)
  removeComponent(Network.instance.localClientEntity, LocalInputReceiverComponent)

  const playerObj = getComponent(Network.instance.localClientEntity, Object3DComponent)
  const texture = await AssetLoader.loadAsync({ url: '/hdr/galaxyTexture.jpg' })

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  hyperspaceEffect.traverse((obj) => {
    obj.layers.enable(CameraLayers.Portal)
    obj.layers.disable(CameraLayers.Scene)
  })
  hyperspaceEffect.position.copy(playerObj.value.position)
  hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

  const light = new AmbientLight('#aaa')
  light.layers.enable(CameraLayers.Portal)
  Engine.scene.add(light)

  Engine.scene.add(hyperspaceEffect)

  // TODO add an ECS thing somewhere to update this properly
  const delta = 1 / 60
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
  Engine.camera.layers.enable(CameraLayers.Portal)
  Engine.camera.layers.enable(CameraLayers.Avatar)
  Engine.camera.layers.disable(CameraLayers.Scene)

  playerObj.value.traverse((obj) => {
    obj.layers.enable(CameraLayers.Avatar)
    obj.layers.disable(CameraLayers.Scene)
  })

  // TODO: add BPCEM of old and new scenes and fade them in and out too
  await hyperspaceEffect.fadeIn(delta)

  await processLocationChange()
  await handleNewScene()

  await new Promise<void>((resolve) => {
    Engine.hasJoinedWorld = true
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, resolve)
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: true })
  })

  await delay(100)

  // teleport player to where the portal is
  const transform = getComponent(Network.instance.localClientEntity, TransformComponent)
  transform.position.set(
    portalComponent.remoteSpawnPosition.x,
    portalComponent.remoteSpawnPosition.y,
    portalComponent.remoteSpawnPosition.z
  )

  const avatar = getComponent(Network.instance.localClientEntity, AvatarComponent)
  rotateViewVectorXZ(avatar.viewVector, portalComponent.remoteSpawnEuler.y)

  createAvatarController(Network.instance.localClientEntity)
  addComponent(Network.instance.localClientEntity, LocalInputReceiverComponent, {})

  await delay(250)

  Engine.camera.layers.enable(CameraLayers.Scene)
  light.removeFromParent()
  light.dispose()

  await hyperspaceEffect.fadeOut(delta)

  playerObj.value.traverse((obj) => {
    obj.layers.enable(CameraLayers.Scene)
    obj.layers.disable(CameraLayers.Avatar)
  })

  Engine.camera.layers.disable(CameraLayers.Portal)
  Engine.camera.layers.disable(CameraLayers.Avatar)

  hyperspaceEffect.removeFromParent()

  clearInterval(hyperSpaceUpdateInterval)

  World.defaultWorld.isInPortal = false
}
