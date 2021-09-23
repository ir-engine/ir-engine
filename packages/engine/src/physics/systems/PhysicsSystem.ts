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
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Network } from '../../networking/classes/Network'
import { VelocityComponent } from '../components/VelocityComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { SpawnNetworkObjectComponent } from '../../scene/components/SpawnNetworkObjectComponent'
import { RigidBodyTagComponent } from '../components/RigidBodyTagComponent'
import { Quaternion, Vector3 } from 'three'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { isClient } from '../../common/functions/isClient'
import { PrefabType } from '../../networking/templates/PrefabType'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { dispatchFromServer } from '../../networking/functions/dispatch'
import {
  NetworkWorldAction,
  NetworkWorldActions,
  NetworkWorldActionType
} from '../../networking/interfaces/NetworkWorldActions'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { NetworkObjectOwnerComponent } from '../../networking/components/NetworkObjectOwnerComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { isDynamicBody, isKinematicBody, isStaticBody } from '../classes/Physics'
import { teleportRigidbody } from '../functions/teleportRigidbody'
import { CollisionComponent } from '../components/CollisionComponent'

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
          teleportRigidbody(colliderComponent.body, new Vector3(x, y, z), new Quaternion(qX, qY, qZ, qW))
          return
        }

        const controllerComponent = getComponent(entity, AvatarControllerComponent)
        if (controllerComponent) {
          const avatar = getComponent(entity, AvatarComponent)
          controllerComponent.controller.setPosition(new Vector3(x, y + avatar.avatarHalfHeight, z))
          const velocity = getComponent(entity, VelocityComponent)
          velocity.velocity.setScalar(0)
        }
      }
      break
  }
}
/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export default async function PhysicsSystem(
  world: World,
  attributes: { simulationEnabled?: boolean }
): Promise<System> {
  const spawnRigidbodyQuery = defineQuery([SpawnNetworkObjectComponent, RigidBodyTagComponent])
  const colliderQuery = defineQuery([ColliderComponent, TransformComponent])
  const raycastQuery = defineQuery([RaycastComponent])
  const collisionComponent = defineQuery([CollisionComponent])
  const clientAuthoritativeQuery = defineQuery([NetworkObjectComponent, NetworkObjectOwnerComponent, ColliderComponent])

  let simulationEnabled = true

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
    if (typeof ev.physics !== 'undefined') {
      simulationEnabled = ev.physics
    }
  })

  world.receptors.add(avatarActionReceptor)

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
        world.physics.removeBody(colliderComponent.body)
      }
    }

    for (const entity of raycastQuery()) {
      world.physics.doRaycast(getComponent(entity, RaycastComponent))
    }

    for (const entity of colliderQuery()) {
      const velocity = getComponent(entity, VelocityComponent)
      if (!velocity) continue
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      if ((!isClient && hasComponent(entity, NetworkObjectOwnerComponent)) || hasComponent(entity, AvatarComponent))
        continue

      if (isStaticBody(collider.body)) {
        const body = collider.body as PhysX.PxRigidDynamic
        const currentPose = body.getGlobalPose()

        velocity.velocity.subVectors(currentPose.translation as Vector3, transform.position)

        currentPose.translation.x = transform.position.x
        currentPose.translation.y = transform.position.y
        currentPose.translation.z = transform.position.z
        currentPose.rotation.x = transform.rotation.x
        currentPose.rotation.y = transform.rotation.y
        currentPose.rotation.z = transform.rotation.z
        currentPose.rotation.w = transform.rotation.w

        if (isKinematicBody(collider.body)) {
          body.setKinematicTarget(currentPose)
        }
        body.setGlobalPose(currentPose, true)
      } else if (isDynamicBody(collider.body)) {
        const body = collider.body as PhysX.PxRigidDynamic

        const linearVelocity = body.getLinearVelocity()
        velocity.velocity.copy(linearVelocity as Vector3)

        const currentPose = body.getGlobalPose()

        transform.position.copy(currentPose.translation as Vector3)

        transform.rotation.copy(currentPose.rotation as Quaternion)
      }
    }

    for (const entity of clientAuthoritativeQuery()) {
      const collider = getComponent(entity, ColliderComponent)
      if (!isClient) {
        const transform = getComponent(entity, TransformComponent)
        const body = collider.body as PhysX.PxRigidDynamic
        teleportRigidbody(body, transform.position, transform.rotation)
      }
    }

    // clear collision components
    for (const entity of collisionComponent()) {
      getComponent(entity, CollisionComponent).collisions = []
    }

    // populate collision components with events over last simulation
    for (const collisionEvent of world.physics.collisionEventQueue) {
      if (collisionEvent.controllerID) {
        const controller = world.physics.controllers.get(collisionEvent.controllerID)
        const entity = (controller as any).userData
        getComponent(entity, CollisionComponent).collisions.push(collisionEvent)
      }
      if (collisionEvent.shapeA) {
        const bodyAID = world.physics.bodyIDByShapeID.get((collisionEvent.shapeA as any)._id)
        const bodyA = world.physics.bodies.get(bodyAID)
        const bodyBID = world.physics.bodyIDByShapeID.get((collisionEvent.shapeB as any)._id)
        const bodyB = world.physics.bodies.get(bodyBID)
        if (!bodyA || !bodyB) continue
        const entityA = (bodyA as any).userData?.entity
        const entityB = (bodyA as any).userData?.entity
        getComponent(entityA, CollisionComponent).collisions.push({
          type: collisionEvent.type,
          bodySelf: bodyA,
          bodyOther: bodyB,
          shapeSelf: collisionEvent.shapeA,
          shapeOther: collisionEvent.shapeB,
          contacts: collisionEvent.contacts
        })
        getComponent(entityB, CollisionComponent).collisions.push({
          type: collisionEvent.type,
          bodySelf: bodyB,
          bodyOther: bodyA,
          shapeSelf: collisionEvent.shapeB,
          shapeOther: collisionEvent.shapeA,
          contacts: collisionEvent.contacts
        })
      }
    }

    // clear collision queue
    world.physics.collisionEventQueue = []

    // step physics world
    for (let i = 0; i < world.physics.substeps; i++) {
      world.physics.scene.simulate(world.physics.stepTime / (1000 * world.physics.substeps), true)
      world.physics.scene.fetchResults(true)
    }
  }
}
