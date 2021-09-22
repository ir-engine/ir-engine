import { Group, Quaternion, Vector3 } from 'three'
import { PhysXInstance } from '../physics/physx'
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
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { World } from '../ecs/classes/World'
import { System } from '../ecs/classes/System'
import matches from 'ts-matches'
import { useWorld } from '../ecs/functions/SystemHooks'
import { dispatchFrom } from '../networking/functions/dispatchFrom'

function avatarActionReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.setXRMode.matches, (a) => {
      if (a.$from !== world.hostId && a.$from !== a.userId) return
      const entity = world.getUserAvatarEntity(a.userId)
      if (typeof entity !== 'undefined') {
        if (a.enabled) {
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
    })

    .when(NetworkWorldAction.teleportObject.matches, (a) => {
      const [x, y, z, qX, qY, qZ, qW] = a.pose

      const entity = world.getNetworkObject(a.networkId)

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
    })
}

export default async function AvatarSystem(world: World): Promise<System> {
  world.receptors.add(avatarActionReceptor)

  const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

  const avatarQuery = defineQuery([AvatarComponent, ColliderComponent])
  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent])

  return () => {
    for (const entity of raycastQuery.exit(world)) {
      const raycast = getComponent(entity, RaycastComponent)

      if (raycast?.raycastQuery) {
        PhysXInstance.instance.removeRaycastQuery(raycast.raycastQuery)
      }
    }

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
      raycastComponent.raycastQuery.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0)

      // TODO: implement scene lower bounds parameter
      if (!isClient && transform.position.y < -10) {
        const { position, rotation } = SpawnPoints.instance.getRandomSpawnPoint()

        const { networkId } = getComponent(entity, NetworkObjectComponent)
        dispatchFrom(world.hostId, () =>
          NetworkWorldAction.teleportObject({
            networkId,
            pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
          })
        )
        continue
      }
    }
  }
}
