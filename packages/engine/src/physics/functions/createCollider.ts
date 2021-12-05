import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { Vector3, Quaternion, CylinderBufferGeometry, Mesh, Object3D } from 'three'
import { ConvexGeometry } from '../../assets/threejs-various/ConvexGeometry'
import { BodyType, ColliderTypes, ObstacleConfig } from '../types/PhysicsTypes'
import { arrayOfPointsToArrayOfVector3 } from '../../scene/functions/arrayOfPointsToArrayOfVector3'
import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import { Entity } from '../../ecs/classes/Entity'
import { ColliderComponent } from '../components/ColliderComponent'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CollisionComponent } from '../components/CollisionComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getTransform } from './parseModelColliders'
import { getGeometryType } from '../classes/Physics'
import { vectorToArray } from './physxHelpers'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Engine } from '../../ecs/classes/Engine'

/**
 * @author Josh Field <github.com/HexaField>
 */

const quat1 = new Quaternion()
const quat2 = new Quaternion()
const xVec = new Vector3(1, 0, 0)
const yVec = new Vector3(0, 1, 0)
const zVec = new Vector3(0, 0, 1)
const halfPI = Math.PI / 2

export type BodyOptions = {
  bodyType?: BodyType
}

export type ShapeOptions = {
  type: ColliderTypes
  bodyType?: BodyType
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
  scale?: Vector3 // internal, whatever
}

export const getCollisionLayer = (options: ShapeOptions) => {
  if (options.type === 'ground') {
    return CollisionGroups.Ground
  }
  if (typeof options.collisionLayer === 'undefined') {
    return options.isTrigger ? CollisionGroups.Trigger : CollisionGroups.Default
  }
  return Number(options.collisionLayer)
}

export const getCollisionMask = (options: ShapeOptions) => {
  switch (options.collisionMask) {
    case undefined:
    case -1:
    case '-1':
    case '':
      return DefaultCollisionMask
    default:
      if (/all/i.test(options.collisionMask as string)) {
        return DefaultCollisionMask
      }
      return Number(options.collisionMask)
  }
}

export const createShape = (entity: Entity, mesh: Mesh, shapeOptions: ShapeOptions): PhysX.PxShape => {
  // type is required
  if (!shapeOptions.type) return undefined!

  // Get accurate scale relative to all parents
  let scale = mesh.scale ?? new Vector3(1, 1, 1)
  let currentChild = mesh as any
  while (currentChild && currentChild.uuid !== Engine.scene.uuid) {
    let parentScale = currentChild.parent?.scale ?? new Vector3(1, 1, 1)
    scale.multiply(parentScale)
    currentChild = currentChild.parent
  }

  console.log('shape scale: ', scale)
  const world = useWorld()

  if (shapeOptions.type === 'trimesh' || shapeOptions.type === 'convex') {
    // if no mesh data, ignore
    if (!mesh.geometry && (!shapeOptions.vertices || !shapeOptions.indices)) return undefined!

    // clone the geometry and apply the scale, as a PhysX body or mesh shape cannot be scaled generically
    const geometry = mergeBufferGeometries([mesh.geometry])
    shapeOptions.vertices = Array.from(geometry!.attributes.position.array)
    shapeOptions.indices = Array.from(geometry!.index!.array)
  }

  // check for case mismatch
  if (typeof shapeOptions.collisionLayer === 'undefined' && typeof (shapeOptions as any).collisionlayer !== 'undefined')
    shapeOptions.collisionLayer = (shapeOptions as any).collisionlayer
  if (typeof shapeOptions.collisionMask === 'undefined' && typeof (shapeOptions as any).collisionmask !== 'undefined')
    shapeOptions.collisionMask = (shapeOptions as any).collisionmask

  let geometry
  switch (shapeOptions.type) {
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
      console.warn('[Create Shape]: cylinder shapes are deprecated')
      // if (!shapeOptions.vertices) {
      //   const geom = new CylinderBufferGeometry(scale.x, scale.x, scale.y) // width & height\
      //   const convexGeom = new ConvexGeometry(arrayOfPointsToArrayOfVector3(geom.attributes.position.array))
      //   shapeOptions.vertices = Array.from(convexGeom.attributes.position.array)
      //   shapeOptions.indices = geom.index ? Array.from(geom.index.array) : Object.keys(shapeOptions.vertices).map(Number)
      //   // TODO - DEBUG CYLINDERS
      //   // const debugMesh = new Mesh(convexGeom, new MeshNormalMaterial())
      //   // debugMesh.position.copy(pos)
      //   // debugMesh.quaternion.copy(rot)
      //   // debugMesh.scale.copy(scale)
      //   // console.log(debugMesh)
      //   // Engine.scene.add(debugMesh)
      // }
      // yes, don't break here - use convex for cylinder
      return undefined!
    case 'convex':
      geometry = world.physics.createConvexMesh(scale, shapeOptions.vertices!)
      const convexMesh = (geometry as PhysX.PxConvexMeshGeometry).getConvexMesh()
      shapeOptions.vertices = vectorToArray(convexMesh.getVertices())
      shapeOptions.indices = vectorToArray(convexMesh.getIndexBuffer())
      shapeOptions.scale = scale
      break

    case 'trimesh':
      geometry = world.physics.createTrimesh(scale, shapeOptions.vertices!, shapeOptions.indices!)
      const triangleMesh = (geometry as PhysX.PxTriangleMeshGeometry).getTriangleMesh()
      shapeOptions.vertices = vectorToArray(triangleMesh.getVertices())
      shapeOptions.indices = vectorToArray(triangleMesh.getTriangles())
      shapeOptions.scale = scale
      break

    default:
      console.error('unknown shape', shapeOptions)
      return undefined!
  }

  const material = world.physics.physics.createMaterial(
    shapeOptions.staticFriction ?? 0.1,
    shapeOptions.dynamicFriction ?? 0.1,
    shapeOptions.restitution ?? 0.1
  )

  const collisionLayer = getCollisionLayer(shapeOptions)
  const collisionMask = getCollisionMask(shapeOptions)

  const contactOffset = typeof shapeOptions.contactOffset === 'undefined' ? 0 : Number(shapeOptions.contactOffset)
  const restOffset = typeof shapeOptions.restOffset === 'undefined' ? 0 : Number(shapeOptions.restOffset)

  const shape = world.physics.createShape(geometry, material, {
    isTrigger: Boolean(shapeOptions.isTrigger),
    collisionLayer,
    collisionMask,
    contactOffset,
    restOffset,
    userData: {
      entity
    }
  })

  const newTransform = {
    translation: new Vector3().copy(mesh.position),
    rotation: new Quaternion().copy(mesh.quaternion)
  }

  const geometryType = getGeometryType(shape)
  // rotate 90 degrees on Z axis as PhysX capsule extend along X axis not the Y axis
  if (geometryType === PhysX.PxGeometryType.eCAPSULE.value) {
    quat1.setFromAxisAngle(zVec, halfPI)
    newTransform.rotation.multiply(quat1)
  }
  // rotate -90 degrees on Y axis as PhysX plane is X+ normaled
  if (geometryType === PhysX.PxGeometryType.ePLANE.value) {
    quat1.setFromAxisAngle(yVec, -halfPI)
    newTransform.rotation.multiply(quat1)
  }
  shape.setLocalPose(newTransform as any)

  Object.entries(shapeOptions).forEach(([key, val]) => {
    shape['_' + key] = val
  })

  return shape
}

export const createBody = (entity: Entity, bodyOptions: any, shapes: PhysX.PxShape[] = []) => {
  const { position, rotation } = getComponent(entity, TransformComponent)
  return useWorld().physics.addBody({
    shapes,
    type: bodyOptions.bodyType ?? BodyType.STATIC,
    transform: {
      translation: position,
      rotation
    },
    userData: {
      entity
    }
  })
}

export const createCollider = (entity: Entity, mesh: Mesh) => {
  const shapes = [createShape(entity, mesh, mesh.userData as any)]
  const body = createBody(entity, mesh.userData, shapes)

  addComponent(entity, ColliderComponent, { body })
  addComponent(entity, CollisionComponent, { collisions: [] })
}

export const createColliderForObject3D = (entity: Entity, data, disableGravity: boolean) => {
  const object3d = getComponent(entity, Object3DComponent)
  console.log('creating collider for object 3d: ', object3d)
  if (object3d) {
    const shapes = getAllShapesFromObject3D(entity, object3d.value as any, data)
    const body = createBody(entity, data, shapes)
    body.setActorFlag(PhysX.PxActorFlag.eDISABLE_GRAVITY, disableGravity)
    addComponent(entity, ColliderComponent, { body })
    addComponent(entity, CollisionComponent, { collisions: [] })
  }
}

export const createObstacleFromMesh = (entity: Entity, mesh: Mesh) => {
  const transform = getComponent(entity, TransformComponent)
  const [position, quaternion, scale] = getTransform(
    mesh.getWorldPosition(new Vector3()),
    mesh.getWorldQuaternion(new Quaternion()),
    mesh.getWorldScale(new Vector3()),
    transform.position,
    transform.rotation,
    transform.scale
  )
  const config: ObstacleConfig = {
    isCapsule: mesh.userData.isCapsule,
    radius: scale.x,
    halfHeight: scale.y,
    halfExtents: scale
  }
  useWorld().physics.createObstacle(position, quaternion, config)
}

const EPSILON = 1e-6
export const getAllShapesFromObject3D = (entity: Entity, asset: Object3D, data: BodyOptions | ShapeOptions) => {
  const shapes: any[] = []
  shapes.push(createShape(entity, asset as any, data as ShapeOptions))

  const shapeObjs: any[] = []
  asset.traverse((mesh: Mesh) => {
    if (typeof mesh.userData['type'] === 'string') {
      shapeObjs.push(mesh)
    }
  })

  shapeObjs.forEach((mesh: Mesh) => {
    mesh.updateMatrixWorld(true)
    if (mesh.scale.x === 0) mesh.scale.x = EPSILON
    if (mesh.scale.y === 0) mesh.scale.y = EPSILON
    if (mesh.scale.z === 0) mesh.scale.z = EPSILON

    if (mesh.userData.type === 'obstacle') {
      createObstacleFromMesh(entity, mesh)
      mesh.removeFromParent()
      return
    }

    const shape = createShape(entity, mesh, mesh.userData as any)
    if (!shape) return
    shapes.push(shape)
    mesh.removeFromParent()
  })

  return shapes.filter((val) => {
    return !!val
  })
}
