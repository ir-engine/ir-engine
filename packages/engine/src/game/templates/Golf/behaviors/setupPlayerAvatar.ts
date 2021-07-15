import { AssetLoader } from '../../../../assets/classes/AssetLoader'
import { AnimationComponent } from '../../../../character/components/AnimationComponent'
import { CharacterComponent } from '../../../../character/components/CharacterComponent'
import { XRInputSourceComponent } from '../../../../character/components/XRInputSourceComponent'
import { SkeletonUtils } from '../../../../character/SkeletonUtils'
import { isClient } from '../../../../common/functions/isClient'
import { EngineEvents } from '../../../../ecs/classes/EngineEvents'
import { Entity } from '../../../../ecs/classes/Entity'
import { delay } from '../../../../ecs/functions/EngineFunctions'
import { getComponent, removeComponent } from '../../../../ecs/functions/EntityFunctions'
import { Input } from '../../../../input/components/Input'
import { Network } from '../../../../networking/classes/Network'
import { XRSystem } from '../../../../xr/systems/XRSystem'

const avatarScale = 1.3

export const setupPlayerAvatar = async (entityPlayer: Entity) => {
  if (!isClient) return

  removeComponent(entityPlayer, AnimationComponent)

  const actor = getComponent(entityPlayer, CharacterComponent)

  actor.modelContainer.children.forEach((child) => child.removeFromParent())
  const headGLTF = await AssetLoader.loadAsync({ url: '/models/golf/avatars/avatar_head.glb' })
  const handGLTF = await AssetLoader.loadAsync({ url: '/models/golf/avatars/avatar_hands.glb' })
  const torsoGLTF = await AssetLoader.loadAsync({ url: '/models/golf/avatars/avatar_torso.glb' })

  const headModel = SkeletonUtils.clone(headGLTF)
  headModel.position.setY(1.6)
  headModel.scale.multiplyScalar(avatarScale)

  const leftHandModel = SkeletonUtils.clone(handGLTF)
  const rightHandModel = SkeletonUtils.clone(handGLTF)
  leftHandModel.scale.set(-1, 1, 1)
  // TODO: replace pos offset with animation hand position once new animation rig is in
  leftHandModel.position.set(0.35, 1, 0)
  leftHandModel.scale.multiplyScalar(avatarScale)
  rightHandModel.position.set(-0.35, 1, 0)
  rightHandModel.scale.multiplyScalar(avatarScale)

  const torsoModel = SkeletonUtils.clone(torsoGLTF)
  torsoModel.position.setY(1.25)
  torsoModel.scale.multiplyScalar(avatarScale)

  actor.modelContainer.add(headModel, leftHandModel, rightHandModel, torsoModel)

  // TEMPORARY until refactor when we can query for components easily
  // this only works for own local entity

  EngineEvents.instance.addEventListener(XRSystem.EVENTS.XR_SESSION, async () => {
    await delay(250)

    const handGLTF = await AssetLoader.loadAsync({ url: '/models/golf/avatars/avatar_hands.glb' })
    const leftHandModel = SkeletonUtils.clone(handGLTF)
    const rightHandModel = SkeletonUtils.clone(handGLTF)
    leftHandModel.scale.set(-1, 1, -1)
    leftHandModel.scale.multiplyScalar(avatarScale)
    rightHandModel.scale.set(1, 1, -1)
    rightHandModel.scale.multiplyScalar(avatarScale)

    const { controllerLeft, controllerRight, controllerGripLeft, controllerGripRight } = getComponent(
      Network.instance.localClientEntity,
      XRInputSourceComponent
    )

    actor.modelContainer.children.forEach((child) => child.removeFromParent())
    controllerGripLeft.children.forEach((child) => child.removeFromParent())
    controllerGripRight.children.forEach((child) => child.removeFromParent())

    leftHandModel.position.set(0, 0, 0)
    rightHandModel.position.set(0, 0, 0)

    controllerLeft.add(leftHandModel)
    controllerRight.add(rightHandModel)
  })
}
