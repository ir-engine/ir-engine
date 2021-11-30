import { AmbientLight, PerspectiveCamera } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { ObjectLayers } from '../constants/ObjectLayers'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { useEngine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PortalComponent } from '../components/PortalComponent'
import { PortalEffect } from '../classes/PortalEffect'
import { Object3DComponent } from '../components/Object3DComponent'
import { delay } from '../../common/functions/delay'
import { createAvatarController } from '../../avatar/functions/createAvatar'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../camera/types/CameraMode'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { setObjectLayers } from './setObjectLayers'

export const teleportToScene = async (
  portalComponent: ReturnType<typeof PortalComponent.get>,
  handleNewScene: () => void
) => {
  useEngine().defaultWorld!.isInPortal = true
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: false })
  useEngine().hasJoinedWorld = false

  const world = useWorld()

  switchCameraMode(world.localClientEntity, { cameraMode: CameraMode.ShoulderCam }, true)

  // remove controller since physics world will be destroyed and we don't want it moving
  world.physics.removeController(getComponent(world.localClientEntity, AvatarControllerComponent).controller)
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
  useEngine().scene.add(light)

  useEngine().scene.add(hyperspaceEffect)

  // TODO add an ECS thing somewhere to update this properly
  const { delta } = world
  const camera = useEngine().scene.getObjectByProperty('isPerspectiveCamera', true as any) as PerspectiveCamera
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

  useEngine().scene.background = null
  useEngine().camera.layers.enable(ObjectLayers.Portal)
  useEngine().camera.layers.enable(ObjectLayers.Avatar)
  useEngine().camera.layers.disable(ObjectLayers.Scene)

  setObjectLayers(playerObj.value, ObjectLayers.Render, ObjectLayers.Avatar)

  // TODO: add BPCEM of old and new scenes and fade them in and out too
  await hyperspaceEffect.fadeIn(delta)

  await unloadScene()
  await handleNewScene()

  await new Promise<void>((resolve) => {
    useEngine().hasJoinedWorld = true
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, resolve)
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: true })
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

  useEngine().camera.layers.enable(ObjectLayers.Scene)
  light.removeFromParent()
  light.dispose()

  await hyperspaceEffect.fadeOut(delta)

  setObjectLayers(playerObj.value, ObjectLayers.Render, ObjectLayers.Scene)

  useEngine().camera.layers.disable(ObjectLayers.Portal)
  useEngine().camera.layers.disable(ObjectLayers.Avatar)

  hyperspaceEffect.removeFromParent()

  clearInterval(hyperSpaceUpdateInterval)

  useEngine().defaultWorld!.isInPortal = false
}
