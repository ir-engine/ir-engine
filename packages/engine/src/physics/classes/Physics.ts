import RAPIER, {
  ActiveCollisionTypes,
  ActiveEvents,
  Collider,
  ColliderDesc,
  EventQueue,
  Ray,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  ShapeType,
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

import { createVector3Proxy } from '../../common/proxies/three'
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
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { ShapecastComponent } from '../components/ShapeCastComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import { getTagComponentForRigidBody } from '../functions/getTagComponentForRigidBody'
import { ColliderDescOptions, CollisionEvents } from '../types/PhysicsTypes'

export type PhysicsWorld = World

function load() {
  // eslint-disable-next-line import/no-named-as-default-member
  return RAPIER.init()
}

function createWorld(gravity = { x: 0.0, y: -9.81, z: 0.0 }) {
  const world = new World(gravity)
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
    rigidBodyDesc.setTranslation(
      position.x + rigidBodyDesc.translation.x,
      position.y + rigidBodyDesc.translation.y,
      position.z + rigidBodyDesc.translation.z
    )
    rigidBodyDesc.setRotation(
      new Quaternion().copy(rotation).multiply(new Quaternion().copy(rigidBodyDesc.rotation as Quaternion))
    )
  }

  const rigidBody = world.createRigidBody(rigidBodyDesc)
  colliderDesc.forEach((desc) => world.createCollider(desc, rigidBody))

  addComponent(entity, RigidBodyComponent, {
    body: rigidBody,
    previousPosition: new Vector3(),
    previousRotation: new Quaternion(),
    previousLinearVelocity: new Vector3(),
    previousAngularVelocity: new Vector3()
  })

  const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, RigidBodyTypeTagComponent, true)

  // set entity in userdata for fast look up when required.
  const rigidBodyUserdata = { entity: entity }
  rigidBody.userData = rigidBodyUserdata

  // TODO: Add only when dynamic or kinematic?
  const linearVelocity = createVector3Proxy(VelocityComponent.linear, entity, new Set())
  const angularVelocity = createVector3Proxy(VelocityComponent.angular, entity, new Set())
  addComponent(entity, VelocityComponent, { linear: linearVelocity, angular: angularVelocity })

  return rigidBody
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

function createColliderDesc(mesh: Mesh, colliderDescOptions: ColliderDescOptions): ColliderDesc {
  // Type is required
  if (typeof colliderDescOptions.type === 'undefined') return undefined!

  let shapeType =
    typeof colliderDescOptions.type === 'string' ? ShapeType[colliderDescOptions.type] : colliderDescOptions.type
  //check for old collider types to allow backwards compatibility
  if (typeof shapeType === 'undefined') {
    switch (colliderDescOptions.type as unknown as string) {
      case 'box':
        shapeType = ShapeType['Cuboid']
        break
      case 'trimesh':
        shapeType = ShapeType['TriMesh']
        break
      case 'capsule':
        shapeType = ShapeType['Capsule']
        break
      case 'cylinder':
        shapeType = ShapeType['Cylinder']
        break
      default:
        console.error('unrecognized collider shape type: ' + colliderDescOptions.type)
    }
  }

  // If custom size has been provided use that else use mesh scale
  const colliderSize = colliderDescOptions.size ? colliderDescOptions.size : mesh.scale

  // Check for case mismatch
  if (
    typeof colliderDescOptions.collisionLayer === 'undefined' &&
    typeof (colliderDescOptions as any).collisionlayer !== 'undefined'
  )
    colliderDescOptions.collisionLayer = (colliderDescOptions as any).collisionlayer
  if (
    typeof colliderDescOptions.collisionMask === 'undefined' &&
    typeof (colliderDescOptions as any).collisionmask !== 'undefined'
  )
    colliderDescOptions.collisionMask = (colliderDescOptions as any).collisionmask

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
      const _buff = mesh.geometry
        .clone()
        .scale(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
      const vertices = new Float32Array(_buff.attributes.position.array)
      const indices = new Uint32Array(_buff.index!.array)
      colliderDesc = ColliderDesc.convexMesh(vertices, indices) as ColliderDesc
      break
    }

    case ShapeType.TriMesh: {
      if (!mesh.geometry)
        return console.warn('[Physics]: Tried to load tri mesh but did not find a geometry', mesh) as any
      const _buff = mesh.geometry
        .clone()
        .scale(Math.abs(colliderSize.x), Math.abs(colliderSize.y), Math.abs(colliderSize.z))
      const vertices = new Float32Array(_buff.attributes.position.array)
      const indices = new Uint32Array(_buff.index!.array)
      colliderDesc = ColliderDesc.trimesh(vertices, indices)
      break
    }

    default:
      console.error('unknown shape', colliderDescOptions)
      return undefined!
  }

  applyDescToCollider(colliderDesc, colliderDescOptions, mesh.position, mesh.quaternion)

  return colliderDesc
}

function createRigidBodyForObject(
  entity: Entity,
  world: World,
  object: Object3D,
  colliderDescOptionsForRoot: ColliderDescOptions
): RigidBody {
  if (!object) return undefined!
  const colliderDescs = [] as ColliderDesc[]

  // create collider desc using userdata of each child mesh
  object.traverse((mesh: Mesh) => {
    const colliderDesc = createColliderDesc(
      mesh,
      mesh === object ? { ...colliderDescOptionsForRoot, ...mesh.userData } : (mesh.userData as ColliderDescOptions)
    )
    if (colliderDesc) colliderDescs.push(colliderDesc)
  })

  const rigidBodyType =
    typeof colliderDescOptionsForRoot['bodyType'] === 'string'
      ? RigidBodyType[colliderDescOptionsForRoot['bodyType']]
      : colliderDescOptionsForRoot['bodyType']

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

  return createRigidBody(entity, world, rigidBodyDesc, colliderDescs)
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

function removeRigidBody(entity: Entity, world: World, hasBeenRemoved = false) {
  const rigidBody = getComponent(entity, RigidBodyComponent, hasBeenRemoved)?.body
  if (rigidBody && world.bodies.contains(rigidBody.handle)) {
    if (!hasBeenRemoved) {
      const RigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)
      removeComponent(entity, RigidBodyTypeTagComponent)
      removeComponent(entity, RigidBodyComponent)
    }

    world.removeRigidBody(rigidBody)
  }
}

function changeRigidbodyType(entity: Entity, newType: RigidBodyType) {
  const rigidBody = getComponent(entity, RigidBodyComponent).body
  const currentRigidBodyTypeTagComponent = getTagComponentForRigidBody(rigidBody)

  removeComponent(entity, currentRigidBodyTypeTagComponent)

  rigidBody.setBodyType(newType)

  const newRigidBodyComponent = getTagComponentForRigidBody(rigidBody)
  addComponent(entity, newRigidBodyComponent, true)
}

function castRay(world: World, raycastQuery: ComponentType<typeof RaycastComponent>) {
  const ray = new Ray(raycastQuery.origin, raycastQuery.direction)
  const maxToi = raycastQuery.maxDistance
  const solid = true // TODO: Add option for this in RaycastComponent?
  const groups = raycastQuery.flags

  raycastQuery.hits = []
  let hitWithNormal = world.castRayAndGetNormal(ray, maxToi, solid, groups)
  if (hitWithNormal != null) {
    raycastQuery.hits.push({
      distance: hitWithNormal.toi,
      position: ray.pointAt(hitWithNormal.toi),
      normal: hitWithNormal.normal,
      body: hitWithNormal.collider.parent() as RigidBody
    })
  }
}

function castRayFromCamera(
  camera: PerspectiveCamera | OrthographicCamera,
  coords: Vector2,
  world: World,
  raycastQuery: ComponentType<typeof RaycastComponent>
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
  return Physics.castRay(world, raycastQuery)
}

function castShape(world: World, shapecastQuery: ComponentType<typeof ShapecastComponent>) {
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
      shapeOther: collider2 as Collider
    })
    collisionComponent2?.set(entity1, {
      type,
      bodySelf: rigidBody2 as RigidBody,
      bodyOther: rigidBody1 as RigidBody,
      shapeSelf: collider2 as Collider,
      shapeOther: collider1 as Collider
    })
  } else {
    const type = isTriggerEvent ? CollisionEvents.TRIGGER_END : CollisionEvents.COLLISION_END
    if (collisionComponent1?.has(entity2)) collisionComponent1.get(entity2)!.type = type
    if (collisionComponent2?.has(entity1)) collisionComponent2.get(entity1)!.type = type
  }
}

export const Physics = {
  load,
  createWorld,
  createRigidBody,
  createColliderDesc,
  applyDescToCollider,
  createRigidBodyForObject,
  createColliderAndAttachToRigidBody,
  removeCollidersFromRigidBody,
  removeRigidBody,
  changeRigidbodyType,
  castRay,
  castRayFromCamera,
  castShape,
  createCollisionEventQueue,
  drainCollisionEventQueue
}
