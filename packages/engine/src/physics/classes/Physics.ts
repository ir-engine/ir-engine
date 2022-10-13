import RAPIER, {
  ActiveCollisionTypes,
  ActiveEvents,
  Collider,
  ColliderDesc,
  EventQueue,
  InteractionGroups,
  QueryFilterFlags,
  Ray,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  ShapeType,
  TempContactForceEvent,
  World
} from '@dimforge/rapier3d-compat'
import {
  BufferGeometry,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Vector2,
  Vector3
} from 'three'

import { cleanupAllMeshData } from '../../assets/classes/AssetLoader'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { Vec3Arg } from '../../renderer/materials/constants/DefaultArgs'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import { getTagComponentForRigidBody, RigidBodyComponent } from '../components/RigidBodyComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import { ColliderDescOptions, CollisionEvents, RaycastHit, SceneQueryType } from '../types/PhysicsTypes'

export type PhysicsWorld = World

function load() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init()
}

function createWorld(gravity = { x: 0.0, y: -9.81, z: 0.0 }) {
  const world = new World(gravity)
  /** @todo create a better api for raycast debugger*/
  ;(world as any).raycastDebugs = []
  return world
}

function createCollisionEventQueue() {
  const collisionEventQueue = new EventQueue(true)
  return collisionEventQueue
}

function createRigidBody(entity: Entity, world: World, rigidBodyDesc: RigidBodyDesc, colliderDesc: ColliderDesc[]) {
  // apply the initial transform if there is one
  if (hasComponent(entity, TransformComponent)) {
    const { position, rotation } = getComponent(entity, TransformComponent)
    rigidBodyDesc.setTranslation(position.x, position.y, position.z)
    rigidBodyDesc.setRotation(rotation)
  }

  const body = world.createRigidBody(rigidBodyDesc)
  colliderDesc.forEach((desc) => world.createCollider(desc, body))

  const rigidBody = addComponent(entity, RigidBodyComponent, {
    body: body,
    previousPosition: proxifyVector3(RigidBodyComponent.previousPosition, entity),
    previousRotation: proxifyQuaternion(RigidBodyComponent.previousRotation, entity),
    previousLinearVelocity: proxifyVector3(RigidBodyComponent.previousLinearVelocity, entity),
    previousAngularVelocity: proxifyVector3(RigidBodyComponent.previousAngularVelocity, entity)
  })

  rigidBody.previousPosition.copy(rigidBody.body.translation() as Vector3)
  rigidBody.previousRotation.copy(rigidBody.body.rotation() as Quaternion)

  const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody.body.bodyType())
  addComponent(entity, RigidBodyTypeTagComponent, true)

  // set entity in userdata for fast look up when required.
  const rigidBodyUserdata = { entity: entity }
  body.userData = rigidBodyUserdata

  // TODO: Add only when dynamic or kinematic?
  const linearVelocity = proxifyVector3(VelocityComponent.linear, entity)
  const angularVelocity = proxifyVector3(VelocityComponent.angular, entity)
  addComponent(entity, VelocityComponent, { linear: linearVelocity, angular: angularVelocity })

  return body
}

function applyDescToCollider(
  colliderDesc: ColliderDesc,
  shapeOptions: ColliderDescOptions,
  position: Vector3,
  quaternion: Quaternion
) {
  if (typeof shapeOptions.friction !== 'undefined') colliderDesc.setFriction(shapeOptions.friction)
  if (typeof shapeOptions.restitution !== 'undefined') colliderDesc.setRestitution(shapeOptions.restitution)

  const collisionLayer =
    typeof shapeOptions.collisionLayer !== 'undefined' ? Number(shapeOptions.collisionLayer) : CollisionGroups.Default
  const collisionMask =
    typeof shapeOptions.collisionMask !== 'undefined' ? Number(shapeOptions.collisionMask) : DefaultCollisionMask
  colliderDesc.setCollisionGroups(getInteractionGroups(collisionLayer, collisionMask))

  colliderDesc.setTranslation(position.x, position.y, position.z)
  colliderDesc.setRotation(quaternion)

  if (typeof shapeOptions.isTrigger !== 'undefined') colliderDesc.setSensor(shapeOptions.isTrigger)

  shapeOptions.activeCollisionTypes
    ? colliderDesc.setActiveCollisionTypes(shapeOptions.activeCollisionTypes)
    : colliderDesc.setActiveCollisionTypes(ActiveCollisionTypes.ALL)
  colliderDesc.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
}

function createColliderDesc(
  mesh: Mesh,
  colliderDescOptions: ColliderDescOptions & { singleton?: boolean }
): ColliderDesc {
  if (!colliderDescOptions.shapeType && colliderDescOptions.type)
    colliderDescOptions.shapeType = colliderDescOptions.type

  // Type is required
  if (typeof colliderDescOptions.shapeType === 'undefined') return undefined!

  let shapeType =
    typeof colliderDescOptions.shapeType === 'string'
      ? ShapeType[colliderDescOptions.shapeType]
      : colliderDescOptions.shapeType
  //check for old collider types to allow backwards compatibility
  if (typeof shapeType === 'undefined') {
    switch (colliderDescOptions.shapeType as unknown as string) {
      case 'box':
        shapeType = ShapeType.Cuboid
        break
      case 'trimesh':
        shapeType = ShapeType.TriMesh
        break
      case 'capsule':
        shapeType = ShapeType.Capsule
        break
      case 'cylinder':
        shapeType = ShapeType.Cylinder
        break
      default:
        console.error('unrecognized collider shape type: ' + colliderDescOptions.shapeType)
    }
  }

  // If custom size has been provided use that else use mesh scale
  const colliderSize = colliderDescOptions.size ? colliderDescOptions.size : mesh.scale

  let colliderDesc: ColliderDesc
  switch (shapeType as ShapeType) {
    case ShapeType.Cuboid:
      colliderDesc = ColliderDesc.cuboid(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
      break

    case ShapeType.Ball:
      colliderDesc = ColliderDesc.ball(Math.abs(colliderSize.x))
      break

    case ShapeType.Capsule:
      colliderDesc = ColliderDesc.capsule(Math.abs(colliderSize.y), Math.abs(colliderSize.x))
      break

    case ShapeType.Cylinder:
      colliderDesc = ColliderDesc.cylinder(Math.abs(colliderSize.y), Math.abs(colliderSize.x))
      break

    case ShapeType.ConvexPolyhedron: {
      if (!mesh.geometry)
        return console.warn('[Physics]: Tried to load convex mesh but did not find a geometry', mesh) as any
      try {
        const _buff = mesh.geometry
          .clone()
          .scale(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
        const vertices = new Float32Array(_buff.attributes.position.array)
        const indices = new Uint32Array(_buff.index!.array)
        colliderDesc = ColliderDesc.convexMesh(vertices, indices) as ColliderDesc
      } catch (e) {
        console.log('Failed to construct collider from trimesh geometry', mesh.geometry, e)
        return undefined!
      }
      break
    }

    case ShapeType.TriMesh: {
      if (!mesh.geometry)
        return console.warn('[Physics]: Tried to load tri mesh but did not find a geometry', mesh) as any
      try {
        const _buff = mesh.geometry
          .clone()
          .scale(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
        const vertices = new Float32Array(_buff.attributes.position.array)
        const indices = new Uint32Array(_buff.index!.array)
        colliderDesc = ColliderDesc.trimesh(vertices, indices)
      } catch (e) {
        console.log('Failed to construct collider from trimesh geometry', mesh.geometry, e)
        return undefined!
      }
      break
    }

    default:
      console.error('unknown shape', colliderDescOptions)
      return undefined!
  }

  const position = colliderDescOptions.singleton ? new Vector3() : mesh.position
  const rotation = colliderDescOptions.singleton ? new Quaternion() : mesh.quaternion

  applyDescToCollider(colliderDesc, colliderDescOptions, position, rotation)

  return colliderDesc
}

function createRigidBodyForGroup(entity: Entity, world: World, colliderDescOptions: ColliderDescOptions): RigidBody {
  const group = getComponent(entity, GroupComponent)
  if (!group) return undefined!

  const colliderDescs = [] as ColliderDesc[]
  const meshesToRemove = [] as Mesh[]

  // create collider desc using userdata of each child mesh
  for (const obj of group) {
    obj.traverse((mesh: Mesh) => {
      // todo: our mesh collider userdata should probably be namespaced, e.g., mesh['XRE_collider'] or something
      const args = { ...colliderDescOptions, ...mesh.userData } as ColliderDescOptions
      const colliderDesc = createColliderDesc(mesh, args)
      if (colliderDesc) {
        if (typeof args.removeMesh === 'undefined' || args.removeMesh === true) meshesToRemove.push(mesh)
        colliderDescs.push(colliderDesc)
      }
    })
  }

  const rigidBodyType =
    typeof colliderDescOptions.bodyType === 'string'
      ? RigidBodyType[colliderDescOptions.bodyType]
      : colliderDescOptions.bodyType

  let rigidBodyDesc: RigidBodyDesc = undefined!
  switch (rigidBodyType) {
    case RigidBodyType.Dynamic:
    default:
      rigidBodyDesc = RigidBodyDesc.dynamic()
      break

    case RigidBodyType.Fixed:
      rigidBodyDesc = RigidBodyDesc.fixed()
      break

    case RigidBodyType.KinematicPositionBased:
      rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
      break

    case RigidBodyType.KinematicVelocityBased:
      rigidBodyDesc = RigidBodyDesc.kinematicVelocityBased()
      break
  }

  const body = createRigidBody(entity, world, rigidBodyDesc, colliderDescs)

  if (!Engine.instance.isEditor)
    for (const mesh of meshesToRemove) {
      // mesh.removeFromParent()
      mesh.traverse((obj: Mesh<any, any>) =>
        cleanupAllMeshData(obj, { uuid: Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)?.uuid })
      )
    }

  return body
}

function createColliderAndAttachToRigidBody(world: World, colliderDesc: ColliderDesc, rigidBody: RigidBody): Collider {
  return world.createCollider(colliderDesc, rigidBody)
}

function removeCollidersFromRigidBody(entity: Entity, world: World) {
  const rigidBody = getComponent(entity, RigidBodyComponent).body
  const numColliders = rigidBody.numColliders()
  for (let index = 0; index < numColliders; index++) {
    const collider = rigidBody.collider(0)
    world.removeCollider(collider, true)
  }
}

function removeRigidBody(entity: Entity, world: World) {
  removeComponent(entity, RigidBodyComponent)
  removeComponent(entity, VelocityComponent)
}

function changeRigidbodyType(entity: Entity, newType: RigidBodyType) {
  const rigidBody = getComponent(entity, RigidBodyComponent).body
  if (newType === rigidBody.bodyType()) return
  const currentRigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody.bodyType())

  removeComponent(entity, currentRigidBodyTypeTagComponent)

  rigidBody.setBodyType(newType)

  const newRigidBodyComponent = getTagComponentForRigidBody(rigidBody.bodyType())
  addComponent(entity, newRigidBodyComponent, true)
}

export type RaycastArgs = {
  type: SceneQueryType
  origin: Vector3
  direction: Vector3
  maxDistance: number
  groups: InteractionGroups
  flags?: QueryFilterFlags
  excludeCollider?: Collider
  excludeRigidBody?: RigidBody
}

function castRay(world: World, raycastQuery: RaycastArgs, filterPredicate?: (collider: Collider) => boolean) {
  const ray = new Ray(raycastQuery.origin, raycastQuery.direction)
  const maxToi = raycastQuery.maxDistance
  const solid = true // TODO: Add option for this in args
  const groups = raycastQuery.groups
  const flags = raycastQuery.flags

  const hits = [] as RaycastHit[]
  let hitWithNormal = world.castRayAndGetNormal(
    ray,
    maxToi,
    solid,
    flags,
    groups,
    raycastQuery.excludeCollider,
    raycastQuery.excludeRigidBody,
    filterPredicate
  )
  if (hitWithNormal != null) {
    hits.push({
      collider: hitWithNormal.collider,
      distance: hitWithNormal.toi,
      position: ray.pointAt(hitWithNormal.toi),
      normal: hitWithNormal.normal,
      body: hitWithNormal.collider.parent() as RigidBody
    })
  }

  ;(world as any).raycastDebugs.push({ raycastQuery, hits })

  return hits
}

function castRayFromCamera(
  camera: PerspectiveCamera | OrthographicCamera,
  coords: Vector2,
  world: World,
  raycastQuery: RaycastArgs,
  filterPredicate?: (collider: Collider) => boolean
) {
  if ((camera as PerspectiveCamera).isPerspectiveCamera) {
    raycastQuery.origin.setFromMatrixPosition(camera.matrixWorld)
    raycastQuery.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(raycastQuery.origin).normalize()
  } else if ((camera as OrthographicCamera).isOrthographicCamera) {
    raycastQuery.origin
      .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
      .unproject(camera)
    raycastQuery.direction.set(0, 0, -1).transformDirection(camera.matrixWorld)
  }
  return Physics.castRay(world, raycastQuery, filterPredicate)
}

export type ShapecastArgs = {
  type: SceneQueryType
  hits: RaycastHit[]
  collider: Collider
  direction: Vector3
  maxDistance: number
  collisionGroups: InteractionGroups
}

function castShape(world: World, shapecastQuery: ShapecastArgs) {
  const maxToi = shapecastQuery.maxDistance
  const groups = shapecastQuery.collisionGroups
  const collider = shapecastQuery.collider

  shapecastQuery.hits = []
  let hitWithNormal = world.castShape(
    collider.translation(),
    collider.rotation(),
    shapecastQuery.direction,
    collider.shape,
    maxToi,
    groups
  )
  if (hitWithNormal != null) {
    shapecastQuery.hits.push({
      distance: hitWithNormal.toi,
      position: hitWithNormal.witness1,
      normal: hitWithNormal.normal1,
      collider: hitWithNormal.collider,
      body: hitWithNormal.collider.parent() as RigidBody
    })
  }
}

const drainCollisionEventQueue = (physicsWorld: World) => (handle1: number, handle2: number, started: boolean) => {
  const collider1 = physicsWorld.getCollider(handle1)
  const collider2 = physicsWorld.getCollider(handle2)
  if (!collider1 || !collider2) return

  const isTriggerEvent = collider1.isSensor() || collider2.isSensor()
  const rigidBody1 = collider1.parent()
  const rigidBody2 = collider2.parent()
  const entity1 = (rigidBody1?.userData as any)['entity']
  const entity2 = (rigidBody2?.userData as any)['entity']

  const collisionComponent1 = getComponent(entity1, CollisionComponent)
  const collisionComponent2 = getComponent(entity2, CollisionComponent)

  if (started) {
    const type = isTriggerEvent ? CollisionEvents.TRIGGER_START : CollisionEvents.COLLISION_START
    collisionComponent1?.set(entity2, {
      type,
      bodySelf: rigidBody1 as RigidBody,
      bodyOther: rigidBody2 as RigidBody,
      shapeSelf: collider1 as Collider,
      shapeOther: collider2 as Collider,
      maxForceDirection: null,
      totalForce: null
    })
    collisionComponent2?.set(entity1, {
      type,
      bodySelf: rigidBody2 as RigidBody,
      bodyOther: rigidBody1 as RigidBody,
      shapeSelf: collider2 as Collider,
      shapeOther: collider1 as Collider,
      maxForceDirection: null,
      totalForce: null
    })
  } else {
    const type = isTriggerEvent ? CollisionEvents.TRIGGER_END : CollisionEvents.COLLISION_END
    if (collisionComponent1?.has(entity2)) collisionComponent1.get(entity2)!.type = type
    if (collisionComponent2?.has(entity1)) collisionComponent2.get(entity1)!.type = type
  }
}

const drainContactEventQueue = (physicsWorld: World) => (event: TempContactForceEvent) => {
  const collider1 = physicsWorld.getCollider(event.collider1())
  const collider2 = physicsWorld.getCollider(event.collider2())

  const rigidBody1 = collider1.parent()
  const rigidBody2 = collider2.parent()
  const entity1 = (rigidBody1?.userData as any)['entity']
  const entity2 = (rigidBody2?.userData as any)['entity']

  const collisionComponent1 = getComponent(entity1, CollisionComponent)
  const collisionComponent2 = getComponent(entity2, CollisionComponent)

  const collision1 = collisionComponent1?.get(entity2)
  const collision2 = collisionComponent2?.get(entity1)

  const maxForceDirection = event.maxForceDirection()
  const totalForce = event.totalForce()

  if (collision1) {
    collision1.maxForceDirection = maxForceDirection
    collision1.totalForce = totalForce
  }

  if (collision2) {
    collision2.maxForceDirection = maxForceDirection
    collision2.totalForce = totalForce
  }
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  createColliderDesc,
  applyDescToCollider,
  createRigidBodyForGroup,
  createColliderAndAttachToRigidBody,
  removeCollidersFromRigidBody,
  removeRigidBody,
  changeRigidbodyType,
  castRay,
  castRayFromCamera,
  castShape,
  createCollisionEventQueue,
  drainCollisionEventQueue,
  drainContactEventQueue
}
