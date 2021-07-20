import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CameraLayers } from '../../camera/constants/CameraLayers'
import { resetFollowCamera } from '../../camera/systems/CameraSystem'
import { CharacterComponent } from '../../character/components/CharacterComponent'
import { ControllerColliderComponent } from '../../character/components/ControllerColliderComponent'
import { lerp } from '../../common/functions/MathLerpFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { delay } from '../../ecs/functions/EngineFunctions'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PortalProps } from '../behaviors/createPortal'
import { PortalEffect } from '../classes/PortalEffect'
import { Object3DComponent } from '../components/Object3DComponent'

export const teleportToScene = async (portalComponent: PortalProps, handleNewScene: () => void) => {
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: false })

  // remove controller since physics world will be destroyed and we don't want it moving
  PhysicsSystem.instance.removeController(
    getComponent(Network.instance.localClientEntity, ControllerColliderComponent).controller
  )
  removeComponent(Network.instance.localClientEntity, ControllerColliderComponent)

  const playerObj = getComponent(Network.instance.localClientEntity, Object3DComponent)
  const texture = await AssetLoader.loadAsync({
    url: '/hdr/galaxyTexture.jpg'
  })
  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  hyperspaceEffect.traverse((obj) => {
    obj.layers.enable(CameraLayers.Portal)
  })
  Engine.scene.add(hyperspaceEffect)
  hyperspaceEffect.position.copy(playerObj.value.position)
  hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

  // TODO add an ECS thing somewhere to update this properly
  const hyperSpaceUpdateInterval = setInterval(() => {
    hyperspaceEffect.update(1 / 60)
  }, 1000 / 60)

  Engine.camera.layers.enable(CameraLayers.Portal)
  Engine.camera.layers.disable(CameraLayers.Scene)

  playerObj.value.traverse((obj) => {
    obj.layers.enable(CameraLayers.Portal)
    obj.layers.disable(CameraLayers.Scene)
  })

  hyperspaceEffect.fadeIn()

  // TODO: add BPCEM of old and new scenes and fade them in and out too

  await new Promise<void>((resolve) => {
    const portalFadeInInterval = setInterval(() => {
      hyperspaceEffect.tubeMesh.position.z = lerp(20, -5, hyperspaceEffect.tubeMaterial.opacity)
      if (!hyperspaceEffect.fadingIn) {
        clearInterval(portalFadeInInterval)
        resolve()
      }
    }, 1000 / 60)
  })

  await handleNewScene()

  await new Promise<void>((resolve) => {
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, resolve)
  })

  await delay(100)

  // teleport player to where the portal is
  const transform = getComponent(Network.instance.localClientEntity, TransformComponent)
  const actor = getComponent(Network.instance.localClientEntity, CharacterComponent)
  transform.position.set(
    portalComponent.spawnPosition.x,
    portalComponent.spawnPosition.y + actor.actorHalfHeight,
    portalComponent.spawnPosition.z
  )
  transform.rotation.copy(portalComponent.spawnRotation)

  resetFollowCamera()

  await delay(100)

  hyperspaceEffect.position.copy(playerObj.value.position)
  hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

  addComponent(Network.instance.localClientEntity, ControllerColliderComponent)

  hyperspaceEffect.fadeOut()

  await delay(250)

  await new Promise<void>((resolve) => {
    const portalFadeOutInterval = setInterval(() => {
      hyperspaceEffect.tubeMesh.position.z = lerp(-5, -200, 1 - hyperspaceEffect.tubeMaterial.opacity)
      if (!hyperspaceEffect.fadingOut) {
        clearInterval(portalFadeOutInterval)
        resolve()
      }
    }, 1000 / 60)
  })

  Engine.camera.layers.enable(CameraLayers.Scene)

  playerObj.value.traverse((obj) => {
    obj.layers.enable(CameraLayers.Scene)
  })

  Engine.camera.layers.disable(CameraLayers.Portal)
  playerObj.value.traverse((obj) => {
    obj.layers.disable(CameraLayers.Portal)
  })

  hyperspaceEffect.removeFromParent()

  clearInterval(hyperSpaceUpdateInterval)

  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: true })
}
