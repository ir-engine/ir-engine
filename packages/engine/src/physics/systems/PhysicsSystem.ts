import { Vector3, Quaternion } from 'three'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { Engine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../components/VelocityComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyTagComponent } from '../components/RigidBodyTagComponent'
import { isClient } from '../../common/functions/isClient'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { isDynamicBody, isKinematicBody, isStaticBody } from '../classes/Physics'
import { teleportRigidbody } from '../functions/teleportRigidbody'
import { CollisionComponent } from '../components/CollisionComponent'
import matches from 'ts-matches'
import { useWorld } from '../../ecs/functions/SystemHooks'

function physicsActionReceptor(action: unknown) {
  const world = useWorld()
  matches(action).when(NetworkWorldAction.teleportObject.matchesFromAny, (a) => {
    const [x, y, z, qX, qY, qZ, qW] = a.pose
    const entity = world.getNetworkObject(a.networkId)

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
  })
}
/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export default async function PhysicsSystem(
  world: World,
  attributes: { simulationEnabled?: boolean }
): Promise<System> {
  const colliderQuery = defineQuery([ColliderComponent])
  const raycastQuery = defineQuery([RaycastComponent])
  const collisionComponent = defineQuery([CollisionComponent])
  const networkColliderQuery = defineQuery([NetworkObjectComponent, ColliderComponent])

  let simulationEnabled = true

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
    if (typeof ev.physics !== 'undefined') {
      simulationEnabled = ev.physics
    }
  })

  world.receptors.push(physicsActionReceptor)

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
      const network = getComponent(entity, NetworkObjectComponent)

      if ((!isClient && network.userId !== Engine.userId) || hasComponent(entity, AvatarComponent)) continue

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

    if (!isClient) {
      for (const entity of networkColliderQuery()) {
        const collider = getComponent(entity, ColliderComponent)
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
        const bodyAID = world.physics.bodyIDByShapeID.get((collisionEvent.shapeA as any)._id)!
        const bodyA = world.physics.bodies.get(bodyAID)
        const bodyBID = world.physics.bodyIDByShapeID.get((collisionEvent.shapeB as any)._id)!
        const bodyB = world.physics.bodies.get(bodyBID)
        if (!bodyA || !bodyB) continue
        const entityA = (bodyA as any).userData?.entity
        const entityB = (bodyB as any).userData?.entity
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
      world.physics.scene.simulate((world.physics.timeScale * world.fixedDelta) / world.physics.substeps, true)
      world.physics.scene.fetchResults(true)
    }
  }
}
