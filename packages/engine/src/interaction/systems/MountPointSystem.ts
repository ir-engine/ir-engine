import { Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { changeState } from '../../avatar/animation/AnimationGraph'
import { AvatarStates } from '../../avatar/animation/Util'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { Physics } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI } from './InteractiveSystem'

/**
 * @todo refactor this into i18n and configurable
 */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

export default async function MountPointSystem(world: World) {
  if (Engine.instance.isEditor) return () => {}

  const mountPointActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)
  const mountPointQuery = defineQuery([MountPointComponent])
  const sittingIdleQuery = defineQuery([SittingComponent])

  return () => {
    for (const entity of mountPointQuery.enter()) {
      const mountPoint = getComponent(entity, MountPointComponent)
      addInteractableUI(entity, createInteractUI(entity, mountPointInteractMessages[mountPoint.type]))
    }

    for (const action of mountPointActionQueue()) {
      if (action.$from !== Engine.instance.userId) continue
      if (!hasComponent(action.targetEntity!, MountPointComponent)) continue
      const avatarEntity = world.getUserAvatarEntity(action.$from)

      const mountPoint = getComponent(action.targetEntity!, MountPointComponent)
      if (mountPoint.type === MountPoint.seat) {
        const avatar = getComponent(avatarEntity, AvatarComponent)

        if (hasComponent(avatarEntity, SittingComponent)) continue

        const transform = getComponent(action.targetEntity!, TransformComponent)
        const controllerComponent = getComponent(avatarEntity, AvatarControllerComponent)
        controllerComponent.body.setTranslation(
          {
            x: transform.position.x,
            y: transform.position.y + avatar.avatarHalfHeight,
            z: transform.position.z
          },
          true
        )
        const sitting = addComponent(avatarEntity, SittingComponent, {
          mountPointEntity: action.targetEntity!,
          state: AvatarStates.SIT_ENTER
        })
        getComponent(avatarEntity, AvatarControllerComponent).movementEnabled = false

        const avatarAnimationComponent = getComponent(avatarEntity, AvatarAnimationComponent)

        changeState(avatarAnimationComponent.animationGraph, AvatarStates.SIT_IDLE)
        sitting.state = AvatarStates.SIT_IDLE
      }
    }

    for (const entity of sittingIdleQuery(world)) {
      const controller = getComponent(entity, AvatarControllerComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const avatarComponent = getComponent(entity, AvatarComponent)
      const sitting = getComponent(entity, SittingComponent)

      if (controller.localMovementDirection.lengthSq() > 0.1) {
        sitting.state = AvatarStates.SIT_LEAVE

        changeState(avatarAnimationComponent.animationGraph, AvatarStates.SIT_LEAVE)

        const avatarTransform = getComponent(entity, TransformComponent)
        const newPos = avatarTransform.position
          .clone()
          .add(new Vector3(0, 0, 1).applyQuaternion(avatarTransform.rotation))

        const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, CollisionGroups.Ground)
        const raycastComponentData = {
          type: SceneQueryType.Closest,
          hits: [],
          origin: newPos,
          direction: new Vector3(0, -1, 0),
          maxDistance: 2,
          flags: interactionGroups
        }
        Physics.castRay(Engine.instance.currentWorld.physicsWorld, raycastComponentData)

        if (raycastComponentData.hits.length > 0) {
          const raycastHit = raycastComponentData.hits[0] as RaycastHit
          if (raycastHit.normal.y > 0.9) {
            newPos.y -= raycastHit.distance
          }
        } else {
          newPos.copy(avatarTransform.position)
          newPos.y += avatarComponent.avatarHalfHeight
        }

        const controllerComponent = getComponent(entity, AvatarControllerComponent)
        controllerComponent.body.setTranslation(newPos, true)

        changeState(avatarAnimationComponent.animationGraph, AvatarStates.LOCOMOTION)
        removeComponent(entity, SittingComponent)
        getComponent(Engine.instance.currentWorld.localClientEntity, AvatarControllerComponent).movementEnabled = true
      }
    }
  }
}
