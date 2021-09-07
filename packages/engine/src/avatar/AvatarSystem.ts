import { Group, Quaternion, Vector3 } from 'three'
import { PhysXInstance } from 'three-physx'
import { isClient } from '../common/functions/isClient'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { ECSWorld } from '../ecs/classes/World'
import { addComponent, getComponent, hasComponent, removeComponent } from '../ecs/functions/EntityFunctions'
import { RaycastComponent } from '../physics/components/RaycastComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
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

export const AvatarSystem = async (): Promise<System> => {
  const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

  const avatarQuery = defineQuery([AvatarComponent, ColliderComponent])
  const avatarRemovedQuery = exitQuery(avatarQuery)

  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const raycastRemovedQuery = exitQuery(raycastQuery)

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

    for (const entity of raycastQuery(world)) {
      const raycastComponent = getComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const avatar = getComponent(entity, AvatarComponent)
      raycastComponent.raycastQuery.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0)

      // TODO: implement scene lower bounds parameter
      if (!isClient && transform.position.y < -10) {
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
    }

    return world
  })
}
