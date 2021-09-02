import { Group, Quaternion, Vector3 } from 'three'
import { ControllerHitEvent, PhysXInstance } from 'three-physx'
import { isClient } from '../common/functions/isClient'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { addComponent, getComponent, hasComponent, removeComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { RaycastComponent } from '../physics/components/RaycastComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { moveAvatar } from './functions/moveAvatar'
import { detectUserInPortal } from './functions/detectUserInPortal'
import { SpawnPoints } from './ServerAvatarSpawnSystem'
import { Network } from '../networking/classes/Network'
import {
  NetworkWorldAction,
  NetworkWorldActions,
  NetworkWorldActionType
} from '../networking/interfaces/NetworkWorldActions'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { dispatchFromServer } from '../networking/functions/dispatch'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  walkSpeed = 1.5
  runSpeed = 5
  jumpHeight = 4
}

export const AvatarControllerSystem = async (): Promise<System> => {
  const vector3 = new Vector3()
  const quat = new Quaternion()
  const quat2 = new Quaternion()
  const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

  const controllerQuery = defineQuery([AvatarControllerComponent])
  const avatarControllerRemovedQuery = exitQuery(controllerQuery)

  const avatarQuery = defineQuery([AvatarComponent, ColliderComponent])
  const avatarRemovedQuery = exitQuery(avatarQuery)

  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const raycastRemovedQuery = exitQuery(raycastQuery)

  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])
  const localXRInputQueryAddQuery = enterQuery(localXRInputQuery)
  const localXRInputQueryRemoveQuery = exitQuery(localXRInputQuery)

  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent])
  const xrInputQueryAddQuery = enterQuery(xrInputQuery)

  function avatarActionReceptor(world: ECSWorld, action: NetworkWorldActionType) {
    switch (action.type) {
      case NetworkWorldActions.ENTER_VR: {
        const entity = Network.instance.networkObjects[action.networkId]?.entity
        if (typeof entity !== 'undefined') {
          if (action.enter) {
            if (!hasComponent(entity, XRInputSourceComponent))
              addComponent(entity, XRInputSourceComponent, {
                controllerLeft: new Group(),
                controllerRight: new Group(),
                controllerGripLeft: new Group(),
                controllerGripRight: new Group(),
                container: new Group(),
                head: new Group()
              })
          } else {
            if (hasComponent(entity, XRInputSourceComponent)) {
              removeComponent(entity, XRInputSourceComponent)
            }
          }
        }
        break
      }
      case NetworkWorldActions.TELEPORT:
        {
          const [x, y, z, qX, qY, qZ, qW] = action.pose

          if (!Network.instance.networkObjects[action.networkId])
            return console.warn(`Entity with id ${action.networkId} does not exist! You should probably reconnect...`)

          const entity = Network.instance.networkObjects[action.networkId].entity

          const colliderComponent = getComponent(entity, ColliderComponent)
          if (colliderComponent) {
            colliderComponent.body.updateTransform({
              translation: { x, y, z },
              rotation: { x: qX, y: qY, z: qZ, w: qW }
            })
            return
          }

          const controllerComponent = getComponent(entity, AvatarControllerComponent)
          if (controllerComponent) {
            const avatar = getComponent(entity, AvatarComponent)
            controllerComponent.controller?.updateTransform({
              translation: { x, y: y + avatar.avatarHalfHeight, z },
              rotation: { x: qX, y: qY, z: qZ, w: qW }
            })
            controllerComponent.controller.velocity.setScalar(0)
          }
        }
        break
    }
  }

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const action of Network.instance.incomingActions) avatarActionReceptor(world, action as any)

    for (const entity of avatarControllerRemovedQuery(world)) {
      const controller = getComponent(entity, AvatarControllerComponent, true)

      if (controller?.controller) {
        PhysXInstance.instance.removeController(controller.controller)
      }

      const avatar = getComponent(entity, AvatarComponent)
      if (avatar) {
        avatar.isGrounded = false
      }
    }

    for (const entity of avatarRemovedQuery(world)) {
      const collider = getComponent(entity, ColliderComponent, true)

      if (collider?.body) {
        PhysXInstance.instance.removeBody(collider.body)
      }
    }

    for (const entity of raycastRemovedQuery(world)) {
      const raycast = getComponent(entity, RaycastComponent, true)

      if (raycast?.raycastQuery) {
        PhysXInstance.instance.removeRaycastQuery(raycast.raycastQuery)
      }
    }

    for (const entity of xrInputQueryAddQuery(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)

      xrInputSourceComponent.container.add(
        xrInputSourceComponent.controllerLeft,
        xrInputSourceComponent.controllerGripLeft,
        xrInputSourceComponent.controllerRight,
        xrInputSourceComponent.controllerGripRight
      )

      xrInputSourceComponent.container.applyQuaternion(rotate180onY)
      object3DComponent.value.add(xrInputSourceComponent.container, xrInputSourceComponent.head)
    }

    for (const entity of localXRInputQueryAddQuery(world)) {
      const avatar = getComponent(entity, AvatarComponent)

      // TODO: Temporarily make rig invisible until rig is fixed
      avatar.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = false
        }
      })
    }

    for (const entity of localXRInputQueryRemoveQuery(world)) {
      const avatar = getComponent(entity, AvatarComponent)
      // TODO: Temporarily make rig invisible until rig is fixed
      avatar?.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = true
        }
      })
    }

    for (const entity of localXRInputQuery(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const transform = getComponent(entity, TransformComponent)

      xrInputSourceComponent.container.updateWorldMatrix(true, true)
      xrInputSourceComponent.container.updateMatrixWorld(true)

      quat.copy(transform.rotation).invert()
      quat2.copy(Engine.camera.quaternion).premultiply(quat)
      xrInputSourceComponent.head.quaternion.copy(quat2)

      vector3.subVectors(Engine.camera.position, transform.position)
      vector3.applyQuaternion(quat)
      xrInputSourceComponent.head.position.copy(vector3)
    }

    for (const entity of raycastQuery(world)) {
      const raycastComponent = getComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const avatar = getComponent(entity, AvatarComponent)
      raycastComponent.raycastQuery.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0)
    }

    for (const entity of controllerQuery(world)) {
      const controller = getComponent(entity, AvatarControllerComponent)

      // iterate on all collisions since the last update
      controller.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => {})

      const avatar = getComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)

      // reset if vals are invalid
      if (isNaN(controller.controller.transform.translation.x)) {
        console.warn('WARNING: Avatar physics data reporting NaN', controller.controller.transform.translation)
        controller.controller.updateTransform({
          translation: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 }
        })
      }

      // TODO: implement scene lower bounds parameter
      if (!isClient && controller.controller.transform.translation.y < -10) {
        const { position, rotation } = SpawnPoints.instance.getRandomSpawnPoint()

        const networkObject = getComponent(entity, NetworkObjectComponent)
        dispatchFromServer(
          NetworkWorldAction.teleportObject(networkObject.networkId, [
            position.x,
            position.y,
            position.z,
            rotation.x,
            rotation.y,
            rotation.z,
            rotation.w
          ])
        )
        continue
      }

      transform.position.set(
        controller.controller.transform.translation.x,
        controller.controller.transform.translation.y - avatar.avatarHalfHeight,
        controller.controller.transform.translation.z
      )

      moveAvatar(entity, delta)

      detectUserInPortal(entity)
    }
    return world
  })
}
