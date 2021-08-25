import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { BodyType, PhysXInstance } from 'three-physx'
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
import { defineQuery, defineSystem, enterQuery, exitQuery, Not, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeComponent } from '../components/ClientAuthoritativeComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export const PhysicsSystem = async (
  attributes: { worker?: () => Worker; simulationEnabled?: boolean } = {}
): Promise<System> => {
  const spawnRigidbodyQuery = defineQuery([SpawnNetworkObjectComponent, RigidBodyTagComponent])
  const spawnRigidbodyAddQuery = enterQuery(spawnRigidbodyQuery)

  const colliderQuery = defineQuery([Not(AvatarComponent), ColliderComponent, TransformComponent])
  const colliderRemoveQuery = exitQuery(colliderQuery)

  const raycastQuery = defineQuery([RaycastComponent])
  const raycastRemoveQuery = exitQuery(raycastQuery)

  const networkObjectQuery = defineQuery([NetworkObjectComponent])
  const networkObjectRemoveQuery = exitQuery(networkObjectQuery)

  const clientAuthoritativeQuery = defineQuery([
    NetworkObjectComponent,
    ClientAuthoritativeComponent,
    ColliderComponent
  ])

  let simulationEnabled = false

  Engine.physxWorker = attributes.worker()

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
    if (typeof ev.physics !== 'undefined') {
      simulationEnabled = ev.physics
    }
  })

  if (!PhysXInstance.instance) {
    PhysXInstance.instance = new PhysXInstance()
  }

  simulationEnabled = attributes.simulationEnabled ?? true

  await PhysXInstance.instance.initPhysX(Engine.physxWorker, Engine.initOptions.physics.settings)
  Engine.workers.push(Engine.physxWorker)

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of spawnRigidbodyAddQuery(world)) {
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
        Network.instance.worldState.createObjects.push({
          networkId: networkId,
          prefabType: PrefabType.RigidBody,
          uniqueId,
          parameters: parameters
        })
      }
    }

    for (const entity of colliderRemoveQuery(world)) {
      const colliderComponent = getComponent(entity, ColliderComponent, true)
      if (colliderComponent) {
        PhysXInstance.instance.removeBody(colliderComponent.body)
      }
    }

    for (const entity of raycastRemoveQuery(world)) {
      const raycastComponent = getComponent(entity, RaycastComponent, true)
      if (raycastComponent) {
        PhysXInstance.instance.removeRaycastQuery(raycastComponent.raycastQuery)
      }
    }

    for (const entity of colliderQuery(world)) {
      const velocity = getComponent(entity, VelocityComponent)
      if (!velocity) continue
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      if ((!isClient && hasComponent(entity, ClientAuthoritativeComponent)) || hasComponent(entity, AvatarComponent))
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

    for (const entity of clientAuthoritativeQuery(world)) {
      const networkObject = getComponent(entity, NetworkObjectComponent)
      const collider = getComponent(entity, ColliderComponent)
      const velocity = getComponent(entity, VelocityComponent)
      if (isClient) {
        Network.instance.clientInputState.transforms.push({
          networkId: networkObject.networkId,
          x: collider.body.transform.translation.x,
          y: collider.body.transform.translation.y,
          z: collider.body.transform.translation.z,
          vX: velocity.velocity.x,
          vY: velocity.velocity.y,
          vZ: velocity.velocity.z,
          qX: collider.body.transform.rotation.x,
          qY: collider.body.transform.rotation.y,
          qZ: collider.body.transform.rotation.z,
          qW: collider.body.transform.rotation.w
        })
      } else {
        const transform = getComponent(entity, TransformComponent)
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation })
      }
    }

    // TODO: this is temporary - we should refactor all our network entity handling to be on the ECS
    for (const entity of networkObjectRemoveQuery(world)) {
      const networkObject = getComponent(entity, NetworkObjectComponent, true)
      delete Network.instance.networkObjects[networkObject.networkId]
      const nameComponent = getComponent(entity, NameComponent)
      nameComponent
        ? console.log(`removed prefab with name ${nameComponent.name} network id: ${networkObject.networkId}`)
        : console.log('removed prefab with id ', networkObject.networkId)
    }

    if (simulationEnabled) PhysXInstance.instance?.update()
    return world
  })
}
