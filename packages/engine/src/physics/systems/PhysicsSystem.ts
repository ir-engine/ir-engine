import { EngineEvents } from '../../ecs/classes/EngineEvents'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { BodyType, PhysXInstance } from '../../physics/physx'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Network } from '../../networking/classes/Network'
import { Engine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../components/VelocityComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { SpawnNetworkObjectComponent } from '../../scene/components/SpawnNetworkObjectComponent'
import { RigidBodyTagComponent } from '../components/RigidBodyTagComponent'
import { Quaternion, Vector3 } from 'three'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { isClient } from '../../common/functions/isClient'
import { PrefabType } from '../../networking/templates/PrefabType'
import { NameComponent } from '../../scene/components/NameComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { dispatchFromServer } from '../../networking/functions/dispatch'
import {
  NetworkWorldAction,
  NetworkWorldActions,
  NetworkWorldActionType
} from '../../networking/interfaces/NetworkWorldActions'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { NetworkObjectOwnerComponent } from '../../networking/components/NetworkObjectOwnerComponent'
import { createPhysXWorker } from '../functions/createPhysXWorker'
import { System } from '../../ecs/classes/System'
import { Not } from 'bitecs'
import { World } from '../../ecs/classes/World'

function avatarActionReceptor(action: NetworkWorldActionType) {
  switch (action.type) {
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

const spawnRigidbodyQuery = defineQuery([SpawnNetworkObjectComponent, RigidBodyTagComponent])
const colliderQuery = defineQuery([ColliderComponent, TransformComponent])
const raycastQuery = defineQuery([RaycastComponent])
const networkObjectQuery = defineQuery([NetworkObjectComponent])
const clientAuthoritativeQuery = defineQuery([NetworkObjectComponent, NetworkObjectOwnerComponent, ColliderComponent])

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export default async function PhysicsSystem(
  world: World,
  attributes: { simulationEnabled?: boolean }
): Promise<System> {
  let simulationEnabled = false

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
    if (typeof ev.physics !== 'undefined') {
      simulationEnabled = ev.physics
    }
  })

  simulationEnabled = attributes.simulationEnabled ?? true

  world.receptors.add(avatarActionReceptor)

  await createPhysXWorker()

  return () => {
    for (const entity of spawnRigidbodyQuery.enter()) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)

      addComponent(entity, TransformComponent, {
        position: new Vector3().copy(parameters.position),
        rotation: new Quaternion().copy(parameters.rotation),
        scale: new Vector3(1, 1, 1)
      })

      // TODO: figure out how we are going to spawn the body

      if (isClient) {
        addComponent(entity, InterpolationComponent, {})
      } else {
        dispatchFromServer(NetworkWorldAction.createObject(networkId, uniqueId, PrefabType.RigidBody, parameters))
      }
    }

    for (const entity of colliderQuery.exit()) {
      const colliderComponent = getComponent(entity, ColliderComponent, true)
      if (colliderComponent?.body) {
        PhysXInstance.instance.removeBody(colliderComponent.body)
      }
    }

    for (const entity of raycastQuery.exit()) {
      const raycastComponent = getComponent(entity, RaycastComponent, true)
      if (raycastComponent) {
        PhysXInstance.instance.removeRaycastQuery(raycastComponent.raycastQuery)
      }
    }

    for (const entity of colliderQuery()) {
      const velocity = getComponent(entity, VelocityComponent)
      if (!velocity) continue
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      if ((!isClient && hasComponent(entity, NetworkObjectOwnerComponent)) || hasComponent(entity, AvatarComponent))
        continue

      if (collider.body.type === BodyType.KINEMATIC || collider.body.type === BodyType.STATIC) {
        velocity.velocity.subVectors(collider.body.transform.translation, transform.position)
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation })
      } else if (collider.body.type === BodyType.DYNAMIC) {
        const { linearVelocity } = collider.body.transform
        velocity.velocity.copy(linearVelocity)

        transform.position.set(
          collider.body.transform.translation.x,
          collider.body.transform.translation.y,
          collider.body.transform.translation.z
        )

        transform.rotation.set(
          collider.body.transform.rotation.x,
          collider.body.transform.rotation.y,
          collider.body.transform.rotation.z,
          collider.body.transform.rotation.w
        )
      }
    }

    for (const entity of clientAuthoritativeQuery()) {
      const collider = getComponent(entity, ColliderComponent)
      if (!isClient) {
        const transform = getComponent(entity, TransformComponent)
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation })
      }
    }

    if (simulationEnabled) PhysXInstance.instance?.update()
  }
}
