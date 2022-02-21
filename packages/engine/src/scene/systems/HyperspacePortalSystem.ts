import { AmbientLight } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { createAvatarController } from '../../avatar/functions/createAvatar'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { CameraMode } from '../../camera/types/CameraMode'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { World } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { InteractorComponent } from '../../interaction/components/InteractorComponent'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { PortalEffect } from '../classes/PortalEffect'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

export default async function HyperspacePortalSystem(world: World) {
  const hyperspaceTagComponent = defineQuery([HyperspaceTagComponent])
  const texture = await AssetLoader.loadAsync({ url: '/hdr/galaxyTexture.jpg' })

  const hyperspaceEffect = new PortalEffect(texture)
  hyperspaceEffect.scale.set(10, 10, 10)
  setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

  const light = new AmbientLight('#aaa')
  light.layers.enable(ObjectLayers.Portal)

  return () => {
    const { delta } = world

    const playerObj = getComponent(world.localClientEntity, Object3DComponent)

    // to trigger the hyperspace effect, add the hyperspace tag to the world entity
    for (const entity of hyperspaceTagComponent.enter()) {
      switchCameraMode(world.localClientEntity, { cameraMode: CameraMode.ShoulderCam }, true)

      removeComponent(world.localClientEntity, AvatarControllerComponent)
      removeComponent(world.localClientEntity, InteractorComponent)
      removeComponent(world.localClientEntity, LocalInputTagComponent)

      setObjectLayers(playerObj.value, ObjectLayers.Avatar)

      // TODO: add BPCEM of old and new scenes and fade them in and out too
      hyperspaceEffect.fadeIn(delta)

      hyperspaceEffect.position.copy(playerObj.value.position)
      hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)
      Engine.camera.zoom = 1.5

      // set scene to render just the hyperspace effect and avatar
      Engine.scene.background = null
      Engine.camera.layers.enable(ObjectLayers.Portal)
      Engine.camera.layers.enable(ObjectLayers.Avatar)
      Engine.camera.layers.disable(ObjectLayers.Scene)

      Engine.scene.add(light)
      Engine.scene.add(hyperspaceEffect)

      // create receptor for joining the world to end the hyperspace effect
      receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, () => {
        hyperspaceEffect.fadeOut(delta).then(() => {
          removeComponent(world.worldEntity, HyperspaceTagComponent)
        })
      })
    }

    // the hyperspace exit runs once the fadeout transition has finished
    for (const entity of hyperspaceTagComponent.exit()) {
      createAvatarController(world.localClientEntity)
      addComponent(world.localClientEntity, LocalInputTagComponent, {})

      hyperspaceEffect.removeFromParent()

      Engine.camera.layers.enable(ObjectLayers.Scene)

      light.removeFromParent()
      light.dispose()

      setObjectLayers(playerObj.value, ObjectLayers.Scene)

      Engine.camera.layers.disable(ObjectLayers.Portal)
      Engine.camera.layers.disable(ObjectLayers.Avatar)
    }

    // run the logic for
    for (const entity of hyperspaceTagComponent()) {
      hyperspaceEffect.update(delta)

      hyperspaceEffect.position.copy(playerObj.value.position)
      hyperspaceEffect.quaternion.copy(playerObj.value.quaternion)

      if (Engine.camera.zoom > 0.75) {
        Engine.camera.zoom -= delta
        Engine.camera.updateProjectionMatrix()
      }
    }
  }
}
