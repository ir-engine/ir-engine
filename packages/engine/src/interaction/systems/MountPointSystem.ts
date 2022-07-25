import { createActionQueue } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { changeState } from '../../avatar/animation/AnimationGraph'
import { animationTimeTransitionRule } from '../../avatar/animation/AnimationStateTransitionsRule'
import { getAnimationAction } from '../../avatar/animation/AvatarAnimationGraph'
import { SingleAnimationState } from '../../avatar/animation/singleAnimationState'
import { AvatarStates } from '../../avatar/animation/Util'
import { AvatarInputSchema } from '../../avatar/AvatarInputSchema'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { BaseInput } from '../../input/enums/BaseInput'
import { MountingComponent } from '../../scene/components/MountingComponent'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI } from './InteractiveSystem'

const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

/**
 * Loads and sets mount animations action to mount state
 * @param mountPointEntity Mount point entity
 * @param avatarEntity Avatar entity which is being mounted
 */
export const setMountAnimationAction = async (avatarEntity: Entity): Promise<void> => {
  const mountPointQuery = defineQuery([MountPointComponent])
  const promises = [] as Promise<any>[]

  for (const mountPointEntity of mountPointQuery.enter()) {
    const mountPoint = getComponent(mountPointEntity, MountPointComponent)
    const animationComponent = getComponent(avatarEntity, AnimationComponent)
    const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)
    const graph = avatarAnimationComponent.animationGraph

    if (mountPoint.animation.enter && !(graph.states[AvatarStates.MOUNT_ENTER] as SingleAnimationState).action) {
      promises.push(
        AssetLoader.loadAsync(mountPoint.animation.enter.file).then((animations) => {
          if (!animations) return
          const action = getAnimationAction(
            mountPoint.animation.enter!.animation,
            animationComponent.mixer,
            animations.animations ?? animations.scene.animations
          )
          ;(graph.states[AvatarStates.MOUNT_ENTER] as SingleAnimationState).action = action

          // need to reapply the rule since the action is changed
          graph.transitionRules[AvatarStates.MOUNT_ENTER][0].rule = animationTimeTransitionRule(action, 0.95)
        })
      )
    }

    if (mountPoint.animation.active && !(graph.states[AvatarStates.MOUNT_ACTIVE] as SingleAnimationState).action) {
      promises.push(
        AssetLoader.loadAsync(mountPoint.animation.active.file).then((animations) => {
          if (!animations) return
          const action = getAnimationAction(
            mountPoint.animation.active!.animation,
            animationComponent.mixer,
            animations.animations ?? animations.scene.animations
          )
          ;(graph.states[AvatarStates.MOUNT_ACTIVE] as SingleAnimationState).action = action
        })
      )
    }

    if (mountPoint.animation.leave && !(graph.states[AvatarStates.MOUNT_LEAVE] as SingleAnimationState).action) {
      promises.push(
        AssetLoader.loadAsync(mountPoint.animation.leave.file).then((animations) => {
          if (!animations) return
          const action = getAnimationAction(
            mountPoint.animation.leave!.animation,
            animationComponent.mixer,
            animations.animations ?? animations.scene.animations
          )
          ;(graph.states[AvatarStates.MOUNT_LEAVE] as SingleAnimationState).action = action
        })
      )
    }
  }

  await Promise.all(promises)
}

/**
 * Updates input action map and remove binding for movement.
 * This is require to play leave animation while maintaining the position.
 * Otherwise avatar will move while playing leave animation.
 *
 * @param mountPointEntity Mount point entity
 * @param avatarEntity Avatar entity which is being mounted
 */
const updateInputActionMap = (mountPointEntity: Entity, avatarEntity: Entity) => {
  // Save previous bindings
  const prevBehaviour = {
    jump: AvatarInputSchema.behaviorMap.get(BaseInput.JUMP),
    forward: AvatarInputSchema.behaviorMap.get(BaseInput.FORWARD),
    backward: AvatarInputSchema.behaviorMap.get(BaseInput.BACKWARD),
    left: AvatarInputSchema.behaviorMap.get(BaseInput.LEFT),
    right: AvatarInputSchema.behaviorMap.get(BaseInput.RIGHT)
  }

  const restoreInputActionMap = (e?: any) => {
    if (e && e.type === 'finished') {
      const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)
      const leaveAction = (
        avatarAnimationComponent.animationGraph.states[AvatarStates.MOUNT_LEAVE] as SingleAnimationState
      ).action

      // return if not emmited by leave action
      if (avatarAnimationComponent && e.action !== leaveAction) return

      // Remove the listener and change animation state to locomotion
      const animationComponent = getComponent(avatarEntity, AnimationComponent)
      animationComponent.mixer.removeEventListener('finished', restoreInputActionMap)
      changeState(avatarAnimationComponent.animationGraph, AvatarStates.LOCOMOTION)
    }

    // Restore the input bindings
    if (prevBehaviour.jump) AvatarInputSchema.behaviorMap.set(BaseInput.JUMP, prevBehaviour.jump)
    if (prevBehaviour.forward) AvatarInputSchema.behaviorMap.set(BaseInput.FORWARD, prevBehaviour.forward)
    if (prevBehaviour.backward) AvatarInputSchema.behaviorMap.set(BaseInput.BACKWARD, prevBehaviour.backward)
    if (prevBehaviour.left) AvatarInputSchema.behaviorMap.set(BaseInput.LEFT, prevBehaviour.left)
    if (prevBehaviour.right) AvatarInputSchema.behaviorMap.set(BaseInput.RIGHT, prevBehaviour.right)
  }

  const restore = (e) => {
    const mountPoint = getComponent(mountPointEntity, MountPointComponent)

    // If there is leave animation on mount point play it otherwise restore the animation
    if (mountPoint.animation.leave) {
      const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)
      const animationComponent = getComponent(avatarEntity, AnimationComponent)

      changeState(avatarAnimationComponent.animationGraph, AvatarStates.MOUNT_LEAVE)
      animationComponent.mixer.addEventListener('finished', restoreInputActionMap)

      // Remove the bindings to prevent avatar movement
      AvatarInputSchema.behaviorMap.delete(BaseInput.JUMP)
      AvatarInputSchema.behaviorMap.delete(BaseInput.FORWARD)
      AvatarInputSchema.behaviorMap.delete(BaseInput.BACKWARD)
      AvatarInputSchema.behaviorMap.delete(BaseInput.LEFT)
      AvatarInputSchema.behaviorMap.delete(BaseInput.RIGHT)
    } else {
      restoreInputActionMap()
    }
  }

  // change the bindings to run restore
  AvatarInputSchema.behaviorMap.set(BaseInput.JUMP, restore)
  AvatarInputSchema.behaviorMap.set(BaseInput.FORWARD, restore)
  AvatarInputSchema.behaviorMap.set(BaseInput.BACKWARD, restore)
  AvatarInputSchema.behaviorMap.set(BaseInput.LEFT, restore)
  AvatarInputSchema.behaviorMap.set(BaseInput.RIGHT, restore)
}

export default async function MountPointSystem(world: World) {
  if (Engine.instance.isEditor) return () => {}

  const mountPointActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)
  const mountPointQuery = defineQuery([MountPointComponent])
  const avatarDesiredTransformQuery = defineQuery([AvatarControllerComponent, DesiredTransformComponent])

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
        const avatarEntity = Engine.instance.currentWorld.namedEntities.get('avatar_' + action.$from)
        if (!avatarEntity) return

        // Add desired transform component to move the avatar to mounting point
        const transform = getComponent(action.targetEntity, TransformComponent)
        addComponent(avatarEntity, DesiredTransformComponent, {
          position: transform.position.clone(),
          rotation: transform.rotation.clone(),
          positionRate: 1,
          rotationRate: 1,
          lockRotationAxis: [false, false, false],
          positionDelta: 0,
          rotationDelta: 0
        })

        // Add mounting point component to avatar to bind avatar with mount point
        if (hasComponent(avatarEntity, MountingComponent)) {
          getComponent(avatarEntity, MountingComponent).mountPointEntity = action.targetEntity
        } else {
          addComponent(avatarEntity, MountingComponent, { mountPointEntity: action.targetEntity })
        }

        // update input bindings
        updateInputActionMap(action.targetEntity, avatarEntity)
      }
    }

    for (const entity of avatarDesiredTransformQuery.exit(world)) {
      const mounting = getComponent(entity, MountingComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const mountPoint = getComponent(mounting.mountPointEntity, MountPointComponent)

      // Once avatar reaches desired transform change animation state to mount enter or mount active
      changeState(
        avatarAnimationComponent.animationGraph,
        mountPoint.animation.enter ? AvatarStates.MOUNT_ENTER : AvatarStates.MOUNT_ACTIVE
      )
    }
  }
}
