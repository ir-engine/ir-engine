import { createActionQueue } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { changeState } from '../../avatar/animation/AnimationGraph'
import { getAnimationAction } from '../../avatar/animation/AvatarAnimationGraph'
import { SingleAnimationState } from '../../avatar/animation/singleAnimationState'
import { AvatarStates } from '../../avatar/animation/Util'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI } from './InteractiveSystem'

const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

const setMountAnimations = async (mountEntity: Entity, avatarEntity: Entity) => {
  const mountPoint = getComponent(mountEntity, MountPointComponent)
  const animationComponent = getComponent(avatarEntity, AnimationComponent)
  const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)

  if (mountPoint.animation.enter) {
    const animations = await AssetLoader.loadAsync(mountPoint.animation.enter.file)
    if (animations) {
      const action = getAnimationAction(
        mountPoint.animation.enter.animation,
        animationComponent.mixer,
        animations.animations ?? animations.scene.animations
      )
      ;(avatarAnimationComponent.animationGraph.states[AvatarStates.MOUNT_ENTER] as SingleAnimationState).action =
        action
    }
  }

  if (mountPoint.animation.leave) {
    const animations = await AssetLoader.loadAsync(mountPoint.animation.leave.file)
    if (animations) {
      const action = getAnimationAction(
        mountPoint.animation.leave.animation,
        animationComponent.mixer,
        animations.animations ?? animations.scene.animations
      )
      ;(avatarAnimationComponent.animationGraph.states[AvatarStates.MOUNT_LEAVE] as SingleAnimationState).action =
        action
    }
  }

  if (mountPoint.animation.active) {
    const animations = await AssetLoader.loadAsync(mountPoint.animation.active.file)
    if (animations) {
      const action = getAnimationAction(
        mountPoint.animation.active.animation,
        animationComponent.mixer,
        animations.animations ?? animations.scene.animations
      )
      ;(avatarAnimationComponent.animationGraph.states[AvatarStates.MOUNT_ACTIVE] as SingleAnimationState).action =
        action
    }
  }
}

export default async function MountPointSystem(world: World) {
  if (Engine.instance.isEditor) return () => {}

  const mountPointActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)
  const mountPointQuery = defineQuery([MountPointComponent])

  return () => {
    for (const entity of mountPointQuery.enter()) {
      const mountPoint = getComponent(entity, MountPointComponent)
      addInteractableUI(entity, createInteractUI(entity, mountPointInteractMessages[mountPoint.type]))
    }

    for (const action of mountPointActionQueue()) {
      if (action.$from !== Engine.instance.userId) continue
      if (!hasComponent(action.targetEntity, MountPointComponent)) continue
      const mountPoint = getComponent(action.targetEntity, MountPointComponent)
      if (mountPoint.type === MountPoint.seat) {
        const entity = Engine.instance.currentWorld.namedEntities.get('avatar_' + action.$from)

        if (entity) {
          const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
          setMountAnimations(action.targetEntity, entity)
          changeState(
            avatarAnimationComponent.animationGraph,
            mountPoint.animation.enter ? AvatarStates.MOUNT_ENTER : AvatarStates.MOUNT_ACTIVE
          )
        }
      }
    }
  }
}
