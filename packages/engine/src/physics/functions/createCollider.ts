import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { Vector3, Quaternion, CylinderBufferGeometry, Mesh } from 'three'
import { ConvexGeometry } from '../../assets/threejs-various/ConvexGeometry'
import { BodyType, ColliderTypes } from '../types/PhysicsTypes'
import { arrayOfPointsToArrayOfVector3 } from '../../scene/functions/arrayOfPointsToArrayOfVector3'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { Entity } from '../../ecs/classes/Entity'
import { ColliderComponent } from '../components/ColliderComponent'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CollisionComponent } from '../components/CollisionComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export type ColliderData = {
  type?: ColliderTypes // TODO: rename this `shape`
  bodytype?: BodyType // TODO: rename this `bodyType`
  isTrigger?: boolean
  staticFriction?: number
  dynamicFriction?: number
  restitution?: number
  vertices?: number[]
  indices?: number[]
  collisionLayer?: number | string
  collisionMask?: number | string
  contactOffset?: number | string
  restOffset?: number | string
}

export const getCollisionLayer = (userData: ColliderData) => {
  if (userData.type === 'ground') {
    return CollisionGroups.Ground
  }
  if (typeof userData.collisionLayer === 'undefined') {
    return userData.isTrigger ? CollisionGroups.Trigger : CollisionGroups.Default
  }
  return Number(userData.collisionLayer)
}

export const getCollisionMask = (userData: ColliderData) => {
  switch (userData.collisionMask) {
    case undefined:
    case -1:
    case '-1':
    case '':
      return DefaultCollisionMask
    default:
      if (/all/i.test(userData.collisionMask as string)) {
        return DefaultCollisionMask
      }
      return Number(userData.collisionMask)
  }
}

export const createCollider = (entity: Entity, mesh: Mesh | any) => {
  const { position, rotation, scale } = getComponent(entity, TransformComponent)

  const world = useWorld()
  const userData = mesh.userData as ColliderData
  // console.log(mesh, userData, pos, rot, scale)

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

  let geometry: PhysX.PxGeometry
  switch (userData.type) {
    case 'box':
      geometry = new PhysX.PxBoxGeometry(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z))
      break

    case 'ground':
      geometry = new PhysX.PxPlaneGeometry()
      break

    case 'sphere':
      geometry = new PhysX.PxSphereGeometry(Math.abs(scale.x))
      break

    case 'capsule':
      geometry = new PhysX.PxCapsuleGeometry(Math.abs(scale.x), Math.abs(scale.y))
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
      geometry = world.physics.createTrimesh(scale, userData.vertices, userData.indices)
      break

    case 'trimesh':
      geometry = world.physics.createConvexMesh(scale, userData.vertices)
      break

    default:
      console.error('unknown shape', userData.type)
  }

  const material = world.physics.physics.createMaterial(
    userData.staticFriction ?? 0.1,
    userData.dynamicFriction ?? 0.1,
    userData.restitution ?? 0.1
  )

  const collisionLayer = getCollisionLayer(userData)
  const collisionMask = getCollisionMask(userData)

  const contactOffset = typeof userData.contactOffset === 'undefined' ? 0 : Number(userData.contactOffset)
  const restOffset = typeof userData.restOffset === 'undefined' ? 0 : Number(userData.restOffset)

  const shape = world.physics.createShape(geometry, material, new Vector3(), new Quaternion(), {
    isTrigger: Boolean(userData.isTrigger),
    collisionLayer,
    collisionMask,
    contactOffset,
    restOffset
  })

  const body = useWorld().physics.addBody({
    shapes: [shape],
    type: userData.bodytype ?? BodyType.STATIC,
    transform: {
      translation: position,
      rotation
    },
    userData: {
      entity
    }
  })

  addComponent(entity, ColliderComponent, { body })
  addComponent(entity, CollisionComponent, { collisions: [] })
}
