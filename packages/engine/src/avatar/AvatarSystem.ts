import { Group, Quaternion, Vector3 } from 'three'
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
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { World } from '../ecs/classes/World'
import { System } from '../ecs/classes/System'
import matches from 'ts-matches'
import { useWorld } from '../ecs/functions/SystemHooks'
import { teleportRigidbody } from '../physics/functions/teleportRigidbody'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { detectUserInTrigger } from './functions/detectUserInTrigger'

function avatarActionReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.setXRMode.matchesFromAny, (a) => {
      if (a.$from !== world.hostId && a.$from !== a.userId) return
      const entity = world.getUserAvatarEntity(a.userId)
      if (!entity) return

      if (a.enabled && !hasComponent(entity, XRInputSourceComponent)) {
        addComponent(entity, XRInputSourceComponent, {
          controllerLeft: new Group(),
          controllerRight: new Group(),
          controllerGripLeft: new Group(),
          controllerGripRight: new Group(),
          container: new Group(),
          head: new Group(),
          hands: [new Group(), new Group()]
        })
      } else {
        if (hasComponent(entity, XRInputSourceComponent)) {
          removeComponent(entity, XRInputSourceComponent)
        }
      }
    })

    .when(NetworkWorldAction.teleportObject.matches, (a) => {
      const [x, y, z, qX, qY, qZ, qW] = a.pose

      const entity = world.getNetworkObject(a.networkId)

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
    })
}

export default async function AvatarSystem(world: World): Promise<System> {
  world.receptors.add(avatarActionReceptor)

  const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent])

  return () => {
    for (const entity of xrInputQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)

      xrInputSourceComponent.container.add(
        xrInputSourceComponent.controllerLeft,
        xrInputSourceComponent.controllerGripLeft,
        xrInputSourceComponent.controllerRight,
        xrInputSourceComponent.controllerGripRight,
        ...xrInputSourceComponent.hands
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
    }
  }
}
