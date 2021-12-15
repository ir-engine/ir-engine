import { AmbientLight, PerspectiveCamera } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { ObjectLayers } from '../constants/ObjectLayers'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { addComponent, getComponent, removeComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
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
  console.log('entering new scene')
  Engine.currentWorld!.isInPortal = true
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: false })
  Engine.hasJoinedWorld = false
  console.log('entering new scene 1')

  const world = useWorld()

  switchCameraMode(world.localClientEntity, { cameraMode: CameraMode.ShoulderCam }, true)
  console.log('entering new scene 2')

  // remove controller since physics world will be destroyed and we don't want it moving
  try {
    world.physics.removeController(getComponent(world.localClientEntity, AvatarControllerComponent).controller)
  } catch (e) {}
  await delay(250)
  if (hasComponent(world.localClientEntity, AvatarControllerComponent))
    removeComponent(world.localClientEntity, AvatarControllerComponent)
  if (hasComponent(world.localClientEntity, InteractorComponent))
    removeComponent(world.localClientEntity, InteractorComponent)
  if (hasComponent(world.localClientEntity, LocalInputTagComponent))
    removeComponent(world.localClientEntity, LocalInputTagComponent)
  console.log('entering new scene 3')

  const playerObj = getComponent(world.localClientEntity, Object3DComponent)
  const texture = await AssetLoader.loadAsync({ url: '/hdr/galaxyTexture.jpg' })
  console.log('entering new scene 4')

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  hyperspaceEffect.position.copy(playerObj.value.position)
  hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Render, ObjectLayers.Portal)
  console.log('entering new scene 5')

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)
  Engine.scene.add(light)

  Engine.scene.add(hyperspaceEffect)
  console.log('entering new scene 6')

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
  console.log('entering new scene 7')

  Engine.scene.background = null
  Engine.camera.layers.enable(ObjectLayers.Portal)
  Engine.camera.layers.enable(ObjectLayers.Avatar)
  Engine.camera.layers.disable(ObjectLayers.Scene)
  console.log('entering new scene 8')

  setObjectLayers(playerObj.value, ObjectLayers.Render, ObjectLayers.Avatar)

  // TODO: add BPCEM of old and new scenes and fade them in and out too
  await hyperspaceEffect.fadeIn(delta)

  console.log('entering new scene 9')
  await unloadScene()
  console.log('entering new scene 10')
  await handleNewScene()
  console.log('entering new scene 11')

  new Promise<void>((resolve) => {
    console.log('entering new scene inside 1')
    Engine.hasJoinedWorld = true
    console.log('entering new scene inside 2')
    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, resolve)
    console.log('entering new scene inside 3')
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, physics: true })
    console.log('entering new scene inside 4')
  })

  console.log('entering new scene 12')
  await delay(100)
  console.log('entering new scene 13')

  // teleport player to where the portal is
  const transform = getComponent(world.localClientEntity, TransformComponent)
  transform.position.set(
    portalComponent.remoteSpawnPosition.x,
    portalComponent.remoteSpawnPosition.y,
    portalComponent.remoteSpawnPosition.z
  )
  console.log('entering new scene 14')

  // const avatar = getComponent(world.localClientEntity, AvatarComponent)
  // rotateViewVectorXZ(avatar.viewVector, portalComponent.remoteSpawnEuler.y)

  createAvatarController(world.localClientEntity)
  addComponent(world.localClientEntity, LocalInputTagComponent, {})

  console.log('entering new scene 15')
  await delay(250)

  Engine.camera.layers.enable(ObjectLayers.Scene)
  light.removeFromParent()
  light.dispose()
  console.log('entering new scene 16')

  await hyperspaceEffect.fadeOut(delta)
  console.log('entering new scene 17')

  setObjectLayers(playerObj.value, ObjectLayers.Render, ObjectLayers.Scene)
  console.log('entering new scene 18')

  Engine.camera.layers.disable(ObjectLayers.Portal)
  Engine.camera.layers.disable(ObjectLayers.Avatar)
  console.log('entering new scene 19')

  hyperspaceEffect.removeFromParent()
  console.log('entering new scene 20')

  clearInterval(hyperSpaceUpdateInterval)
  console.log('entering new scene 21')

  console.log('exited portal')
  Engine.currentWorld!.isInPortal = false
}
