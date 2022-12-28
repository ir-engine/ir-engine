import { Matrix4, Quaternion, Vector3 } from 'three'

import { addActionReceptor, dispatchAction, getState } from '@xrengine/hyperflux'

import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { V_000, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setComputedTransformComponent } from '../transform/components/ComputedTransformComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from './components/AvatarIKComponents'
import { respawnAvatar } from './functions/respawnAvatar'
import { AvatarInputSettingsReceptor } from './state/AvatarInputSettingsState'

/**
 * TODO: convert this to hyperflux state #7262
 */
export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  // Speeds are same as animation's root motion - in meters per second
  walkSpeed = 1.6762927669761485
  runSpeed = 3.769894125544925 * 1.5
  jumpHeight = 2
}

export default async function AvatarControllerSystem(world: World) {
  const localControllerQuery = defineQuery([AvatarControllerComponent, LocalInputTagComponent])
  const controllerQuery = defineQuery([AvatarControllerComponent])

  addActionReceptor(AvatarInputSettingsReceptor)

  const execute = () => {
    for (const avatarEntity of localControllerQuery.enter()) {
      const controller = getComponent(avatarEntity, AvatarControllerComponent)

      let targetEntity = avatarEntity
      if (hasComponent(avatarEntity, AvatarComponent)) {
        const avatarComponent = getComponent(avatarEntity, AvatarComponent)
        targetEntity = createEntity()
        setComponent(targetEntity, NameComponent, `Camera Target for: ${getComponent(avatarEntity, NameComponent)}`)
        setTransformComponent(targetEntity)
        setComputedTransformComponent(targetEntity, avatarEntity, () => {
          const avatarTransform = getComponent(avatarEntity, TransformComponent)
          const targetTransform = getComponent(targetEntity, TransformComponent)
          targetTransform.position.copy(avatarTransform.position).y += avatarComponent.avatarHeight * 0.95
        })
      }

      setComponent(controller.cameraEntity, FollowCameraComponent, { targetEntity })

      dispatchAction(WorldNetworkAction.spawnCamera({}))
    }

    for (const entity of controllerQuery()) {
      const controller = getComponent(entity, AvatarControllerComponent)
      const followCamera = getOptionalComponent(controller.cameraEntity, FollowCameraComponent)
      if (followCamera) {
        // todo calculate head size and use that as the bound #7263
        if (followCamera.distance < 0.6) setComponent(entity, AvatarHeadDecapComponent, true)
        else removeComponent(entity, AvatarHeadDecapComponent)
      }
    }

    const controlledEntity = Engine.instance.currentWorld.localClientEntity

    if (hasComponent(controlledEntity, AvatarControllerComponent)) {
      const controller = getComponent(controlledEntity, AvatarControllerComponent)

      if (controller.movementEnabled) {
        /** Support multiple peers controlling the same avatar by detecting movement and overriding network authority.
         *    @todo we may want to make this an networked action, rather than lazily removing the NetworkObjectAuthorityTag
         *    if detecting input on the other user #7263
         */
        if (
          !hasComponent(controlledEntity, NetworkObjectAuthorityTag) &&
          world.worldNetwork &&
          controller.gamepadWorldMovement.lengthSq() > 0.1
        ) {
          const networkObject = getComponent(controlledEntity, NetworkObjectComponent)
          dispatchAction(
            WorldNetworkAction.transferAuthorityOfObject({
              ownerId: networkObject.ownerId,
              networkId: networkObject.networkId,
              newAuthority: world.worldNetwork?.peerID
            })
          )
          setComponent(controlledEntity, NetworkObjectAuthorityTag)
        }
      }

      const rigidbody = getComponent(controlledEntity, RigidBodyComponent)
      if (rigidbody.body.translation().y < -10) respawnAvatar(controlledEntity)
    }
  }

  const cleanup = async () => {
    removeQuery(world, localControllerQuery)
    removeQuery(world, controllerQuery)
  }

  return { execute, cleanup }
}
