import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { ShapeType, SHAPES, Body, BodyType, PhysXInstance } from 'three-physx'
import { Vector3, Quaternion, CylinderBufferGeometry, Mesh, MeshNormalMaterial } from 'three'
import { ConvexGeometry } from '../../assets/threejs-various/ConvexGeometry'
import { ColliderTypes } from '../types/PhysicsTypes'
import { arrayOfPointsToArrayOfVector3 } from '../../scene/functions/arrayOfPointsToArrayOfVector3'
import { Engine } from '../../ecs/classes/Engine'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

// its for static world colliders (wall, floar)
const quat1 = new Quaternion()
const quat2 = new Quaternion()
const xVec = new Vector3(1, 0, 0)
const halfPI = Math.PI / 2

type ColliderData = {
  type?: ColliderTypes
  bodytype?: BodyType
  isTrigger?: boolean
  staticFriction?: number
  dynamicFriction?: number
  restitution?: number
  vertices?: number[]
  indices?: number[]
  collisionLayer?: number | string
  collisionMask?: number | string
}

export function createCollider(
  mesh: Mesh | any,
  pos = new Vector3(),
  rot = new Quaternion(),
  scale = new Vector3(1, 1, 1)
): Body {
  const userData = mesh.userData as ColliderData
  // console.log(userData, pos, rot, scale)

  if (!userData.type) return
  if (userData.type === 'trimesh' || userData.type === 'convex') {
    // if no mesh data, ignore
    if (!mesh.geometry && (!userData.vertices || !userData.indices)) return

    // clone the geometry and apply the scale, as a PhysX body or mesh shape cannot be scaled generically
    const geometry = mergeBufferGeometries([mesh.geometry])
    geometry.scale(scale.x, scale.y, scale.z)
    userData.vertices = Array.from(geometry.attributes.position.array)
    userData.indices = Array.from(geometry.index.array)
  }

  // check for case mismatch
  if (typeof userData.collisionLayer === 'undefined' && typeof (userData as any).collisionlayer !== 'undefined')
    userData.collisionLayer = (userData as any).collisionlayer
  if (typeof userData.collisionMask === 'undefined' && typeof (userData as any).collisionmask !== 'undefined')
    userData.collisionMask = (userData as any).collisionmask

  const shapeArgs: ShapeType = { config: {} }
  switch (userData.type) {
    case 'box':
      shapeArgs.shape = SHAPES.Box
      shapeArgs.options = { boxExtents: { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) } }
      break

    case 'ground':
      shapeArgs.shape = SHAPES.Plane
      quat1.setFromAxisAngle(xVec, -halfPI)
      quat2.set(rot.x, rot.y, rot.z, rot.w)
      rot = quat2.multiply(quat1)
      break

    case 'sphere':
      shapeArgs.shape = SHAPES.Sphere
      shapeArgs.options = { radius: Math.abs(scale.x) }
      break

    case 'capsule':
      shapeArgs.shape = SHAPES.Capsule
      shapeArgs.options = { halfHeight: Math.abs(scale.y), radius: Math.abs(scale.x) }
      break

    // physx doesnt have cylinder shapes, default to convex
    case 'cylinder':
      if (!userData.vertices) {
        const geom = new CylinderBufferGeometry(scale.x, scale.x, scale.y) // width & height\
        const convexGeom = new ConvexGeometry(arrayOfPointsToArrayOfVector3(geom.attributes.position.array))
        userData.vertices = Array.from(convexGeom.attributes.position.array)
        userData.indices = geom.index ? Array.from(geom.index.array) : Object.keys(userData.vertices).map(Number)
        // TODO - DEBUG CYLINDERS
        // const debugMesh = new Mesh(convexGeom, new MeshNormalMaterial())
        // debugMesh.position.copy(pos)
        // debugMesh.quaternion.copy(rot)
        // debugMesh.scale.copy(scale)
        // console.log(debugMesh)
        // Engine.scene.add(debugMesh)
      }
    // yes, don't break here - use convex for cylinder
    case 'convex':
      shapeArgs.shape = SHAPES.ConvexMesh
      shapeArgs.options = { vertices: [...userData.vertices], indices: [...userData.indices] }
      break

    case 'trimesh':
      shapeArgs.shape = SHAPES.TriangleMesh
      shapeArgs.options = { vertices: [...userData.vertices], indices: [...userData.indices] }
      break

    default:
      console.error('unknown shape', userData.type)
  }

  shapeArgs.config.material = {
    staticFriction: userData.staticFriction ?? 0.1,
    dynamicFriction: userData.dynamicFriction ?? 0.1,
    restitution: userData.restitution ?? 0.1
  }

  shapeArgs.config.collisionLayer = Number(
    userData.collisionLayer ?? (userData.isTrigger ? CollisionGroups.Trigger : CollisionGroups.Default)
  )
  switch (userData.collisionMask) {
    case undefined:
    case -1:
    case '-1':
    case '':
      shapeArgs.config.collisionMask = DefaultCollisionMask
      break
    default:
      if (/all/i.test(userData.collisionMask as string)) shapeArgs.config.collisionMask = DefaultCollisionMask
      else shapeArgs.config.collisionMask = Number(userData.collisionMask)
      break
  }

  if (userData.type === 'ground') {
    shapeArgs.config.collisionLayer = CollisionGroups.Ground
  }

  if (userData.isTrigger) {
    shapeArgs.config.isTrigger = Boolean(userData.isTrigger)
  }

  const body = new Body({
    shapes: [shapeArgs],
    type: userData.bodytype ?? BodyType.STATIC,
    transform: {
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      // scale: { x: scale.x, y: scale.y, z: scale.z }, // this actually does nothing, physx doesn't have a scale param apparently...
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 }
    }
  })

  PhysXInstance.instance.addBody(body)

  return body
}
