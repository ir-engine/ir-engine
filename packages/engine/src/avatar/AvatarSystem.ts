import { Group, Quaternion, Vector3 } from 'three'
import { isClient } from '../common/functions/isClient'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../ecs/functions/ComponentFunctions'
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
import { World } from '../ecs/classes/World'
import { System } from '../ecs/classes/System'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { teleportRigidbody } from '../physics/functions/teleportRigidbody'
import { detectUserInTrigger } from './functions/detectUserInTrigger'

export default async function AvatarSystem(world: World): Promise<System> {
  const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

  const avatarQuery = defineQuery([AvatarComponent, ColliderComponent])
  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent])

  function avatarActionReceptor(action: NetworkWorldActionType) {
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
            teleportRigidbody(colliderComponent.body, new Vector3(x, y, z), new Quaternion(qX, qY, qZ, qW))
            return
          }

          const controllerComponent = getComponent(entity, AvatarControllerComponent)
          if (controllerComponent) {
            const velocity = getComponent(entity, VelocityComponent)
            const avatar = getComponent(entity, AvatarComponent)
            controllerComponent.controller.setPosition({ x, y: y + avatar.avatarHalfHeight, z })
            velocity.velocity.setScalar(0)
          }
        }
        break
    }
  }

  world.receptors.add(avatarActionReceptor)

  return () => {
    for (const entity of xrInputQuery.enter(world)) {
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
      raycastComponent.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.hits.length > 0)

      detectUserInTrigger(entity)

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
  }
}
