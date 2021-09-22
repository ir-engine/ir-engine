import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { BodyType, PhysXInstance } from '../../physics/physx'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Engine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../components/VelocityComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyTagComponent } from '../components/RigidBodyTagComponent'
import { isClient } from '../../common/functions/isClient'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { createPhysXWorker } from '../functions/createPhysXWorker'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import matches from 'ts-matches'
import { useWorld } from '../../ecs/functions/SystemHooks'

function avatarActionReceptor(action) {
  matches(action).when(NetworkWorldAction.teleportObject.matches, (a) => {
    const [x, y, z, qX, qY, qZ, qW] = a.pose

    const entity = useWorld().getNetworkObject(a.networkId)

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

const rigidbodyQuery = defineQuery([RigidBodyTagComponent])
const colliderQuery = defineQuery([ColliderComponent, TransformComponent])
const raycastQuery = defineQuery([RaycastComponent])
const networkColliderQuery = defineQuery([NetworkObjectComponent, ColliderComponent])

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export default async function PhysicsSystem(
  world: World,
  attributes: { simulationEnabled?: boolean }
): Promise<System> {
  console.log('PhysicsSystem being initialized')
  let simulationEnabled = false

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
    console.log('Physics System got ENABLE_SCENE')
    if (typeof ev.physics !== 'undefined') {
      simulationEnabled = ev.physics
    }
  })

  simulationEnabled = attributes.simulationEnabled ?? true
  console.log('simulationEnabled', simulationEnabled)

  world.receptors.add(avatarActionReceptor)
  console.log('Added avatarActionReceptor to world')

  await createPhysXWorker()
  console.log('created PhysXWorker')

  return () => {
    // for (const entity of spawnRigidbodyQuery.enter()) {
    //   const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)

    //   addComponent(entity, TransformComponent, {
    //     position: new Vector3().copy(parameters.position),
    //     rotation: new Quaternion().copy(parameters.rotation),
    //     scale: new Vector3(1, 1, 1)
    //   })

    //   // TODO: figure out how we are going to spawn the body

    //   if (isClient) {
    //     addComponent(entity, InterpolationComponent, {})
    //   } else {
    //     dispatchFromServer(NetworkWorldAction.createObject(networkId, uniqueId, PrefabType.RigidBody, parameters))
    //   }
    // }

    for (const entity of colliderQuery.exit()) {
      const colliderComponent = getComponent(entity, ColliderComponent)
      if (colliderComponent?.body) {
        PhysXInstance.instance.removeBody(colliderComponent.body)
      }
    }

    for (const entity of raycastQuery.exit()) {
      const raycastComponent = getComponent(entity, RaycastComponent)
      if (raycastComponent) {
        PhysXInstance.instance.removeRaycastQuery(raycastComponent.raycastQuery)
      }
    }

    for (const entity of colliderQuery()) {
      const velocity = getComponent(entity, VelocityComponent)
      if (!velocity) continue
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      const network = getComponent(entity, NetworkObjectComponent)

      if ((!isClient && network.userId === Engine.userId) || hasComponent(entity, AvatarComponent)) continue

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

    for (const entity of networkColliderQuery()) {
      const collider = getComponent(entity, ColliderComponent)
      if (!isClient) {
        const transform = getComponent(entity, TransformComponent)
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation })
      }
    }

    if (simulationEnabled) PhysXInstance.instance?.update()
  }
}
