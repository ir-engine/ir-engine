import { pipe } from 'bitecs'
import { Box3, Mesh, Quaternion, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { teleportObjectReceptor } from '../../avatar/AvatarSystem'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkObjectDirtyTag } from '../../networking/components/NetworkObjectDirtyTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isDynamicBody, isStaticBody } from '../classes/Physics'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { teleportRigidbody } from '../functions/teleportRigidbody'

// Receptor
export function physicsActionReceptor(
  action: typeof WorldNetworkAction.teleportObject.matches._TYPE,
  world = Engine.instance.currentWorld
) {
  const [x, y, z, qX, qY, qZ, qW] = action.pose
  const entity = world.getNetworkObject(action.object.ownerId, action.object.networkId)!
  const colliderComponent = getComponent(entity, ColliderComponent)
  if (colliderComponent) {
    teleportRigidbody(colliderComponent.body, new Vector3(x, y, z), new Quaternion(qX, qY, qZ, qW))
  }
}

// Queries
const boxQuery = defineQuery([BoundingBoxComponent, Object3DComponent])
const networkColliderQuery = defineQuery([NetworkObjectComponent, ColliderComponent, NetworkObjectDirtyTag])
const raycastQuery = defineQuery([RaycastComponent])
const colliderQuery = defineQuery([ColliderComponent])
const collisionComponent = defineQuery([CollisionComponent])

// Simulation Handlers

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const scratchBox = new Box3()
const processBoundingBox = (entity: Entity, force = false) => {
  const boundingBox = getComponent(entity, BoundingBoxComponent)
  if (boundingBox.dynamic || force) {
    const object3D = getComponent(entity, Object3DComponent)
    let object3DAABB = boundingBox.box.makeEmpty()
    object3D.value.traverse((mesh: Mesh) => {
      if (mesh instanceof Mesh) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox() // only here for edge cases, this would already be calculated
        const meshAABB = scratchBox.copy(mesh.geometry.boundingBox!)
        meshAABB.applyMatrix4(mesh.matrixWorld)
        object3DAABB.union(meshAABB)
      }
    })
  }
}

const processRaycasts = (world: World) => {
  for (const entity of raycastQuery()) {
    world.physics.doRaycast(getComponent(entity, RaycastComponent))
  }
  return world
}

const processNetworkBodies = (world: World) => {
  // Set network state to physics body pose for objects not owned by this user.
  for (const entity of networkColliderQuery()) {
    const network = getComponent(entity, NetworkObjectComponent)

    // const nameComponent = getComponent(entity, NameComponent)

    // Ignore if we own this object or no new network state has been received for this object
    // (i.e. packet loss and/or state not sent out from server because no change in state since last frame)
    if (network.ownerId === Engine.instance.userId) {
      // console.log('ignoring state for:', nameComponent)
      continue
    }

    const collider = getComponent(entity, ColliderComponent)
    const transform = getComponent(entity, TransformComponent)
    const body = collider.body as PhysX.PxRigidDynamic
    if (!isDynamicBody(body)) continue

    teleportRigidbody(body, transform.position, transform.rotation)

    const linearVelocity = getComponent(entity, VelocityComponent).linear
    const angularVelocity = getComponent(entity, VelocityComponent).angular
    body.setLinearVelocity(linearVelocity, true)
    body.setAngularVelocity(angularVelocity, true)

    removeComponent(entity, NetworkObjectDirtyTag)

    // console.log(
    //   'physics velocity of network object:',
    //   nameComponent.name,
    //   world.fixedTick,
    //   angularVelocity.x,
    //   angularVelocity.y,
    //   angularVelocity.z
    // )
  }
  return world
}

const processBodies = (world: World) => {
  for (const entity of colliderQuery()) {
    const velocity = getComponent(entity, VelocityComponent)
    const collider = getComponent(entity, ColliderComponent)
    const transform = getComponent(entity, TransformComponent)

    if (hasComponent(entity, AvatarComponent)) continue

    if (Engine.instance.isEditor || isStaticBody(collider.body)) {
      const body = collider.body as PhysX.PxRigidDynamic
      const currentPose = body.getGlobalPose()

      if (velocity) {
        velocity.linear.subVectors(currentPose.translation as Vector3, transform.position)
        velocity.angular.setScalar(0) // TODO: Assuming zero velocity for static objects for now.
      } else {
        // console.warn("Physics entity found with no velocity component!")
      }

      teleportRigidbody(body, transform.position, transform.rotation)
    } else if (isDynamicBody(collider.body)) {
      const body = collider.body as PhysX.PxRigidDynamic

      const linearVelocity = body.getLinearVelocity()
      const angularVelocity = body.getAngularVelocity()
      if (velocity) {
        velocity.linear.copy(linearVelocity as Vector3)
        velocity.angular.copy(angularVelocity as Vector3)

        // const nameComponent = getComponent(entity, NameComponent)
        // console.log("setting velocity component:", nameComponent.name, angularVelocity.x, angularVelocity.y, angularVelocity.z)
      } else {
        // console.warn("Physics entity found with no velocity component!")
      }

      const currentPose = body.getGlobalPose()

      transform.position.copy(currentPose.translation as Vector3)
      transform.rotation.copy(currentPose.rotation as Quaternion)
    }
  }
  return world
}

const processCollisions = (world: World) => {
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

  return world
}

const simulationPipeline = pipe(processRaycasts, processNetworkBodies, processBodies, processCollisions)

export default async function PhysicsSystem(world: World) {
  const teleportObjectQueue = createActionQueue(WorldNetworkAction.teleportObject.matches)

  await world.physics.createScene()

  return () => {
    for (const action of teleportObjectQueue()) teleportObjectReceptor(action)

    for (const entity of boxQuery.enter()) {
      processBoundingBox(entity, true)
    }

    for (const entity of colliderQuery.exit()) {
      const colliderComponent = getComponent(entity, ColliderComponent, true)
      if (colliderComponent?.body) {
        world.physics.removeBody(colliderComponent.body)
      }
    }

    if (Engine.instance.isEditor) return

    simulationPipeline(world)

    // step physics world
    for (let i = 0; i < world.physics.substeps; i++) {
      world.physics.scene.simulate((world.physics.timeScale * world.fixedDeltaSeconds) / world.physics.substeps, true)
      world.physics.scene.fetchResults(true)
    }
  }
}
