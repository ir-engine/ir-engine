import { Quaternion, Vector3 } from 'three'
import { TransformType, SHAPES } from './types/ThreePhysX'
import { putIntoPhysXHeap } from './utils/misc'
import { PhysXManager } from './worker'

const quat1 = new Quaternion()
const quat2 = new Quaternion()
const yVec = new Vector3(0, 1, 0)
const zVec = new Vector3(0, 0, 1)
const halfPI = Math.PI / 2

export const getShape = ({ shape, transform, options, config }): PhysX.PxShape => {
  const geometry = getGeometry({ shape, transform, options })
  if (!geometry) return

  const material = PhysXManager.instance.physics.createMaterial(
    config.material?.staticFriction ?? 0,
    config.material?.dynamicFriction ?? 0,
    config.material?.restitution ?? 0
  )
  const flags = new PhysX.PxShapeFlags(
    PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
      (config?.isTrigger ? PhysX.PxShapeFlag.eTRIGGER_SHAPE.value : PhysX.PxShapeFlag.eSIMULATION_SHAPE.value)
  )

  const newShape = PhysXManager.instance.physics.createShape(geometry, material, false, flags)
  // rotate 90 degrees on Z axis as PhysX capsule extend along X axis not the Y axis
  if (shape === SHAPES.Capsule) {
    quat1.setFromAxisAngle(zVec, halfPI)
    quat2.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w)
    quat2.multiply(quat1)
    transform.rotation = {
      x: quat2.x,
      y: quat2.y,
      z: quat2.z,
      w: quat2.w
    }
  }
  // rotate -90 degrees on Y axis as PhysX plane is X+ normaled
  if (shape === SHAPES.Plane) {
    quat1.setFromAxisAngle(yVec, -halfPI)
    quat2.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w)
    quat2.multiply(quat1)
    transform.rotation = {
      x: quat2.x,
      y: quat2.y,
      z: quat2.z,
      w: quat2.w
    }
  }
  //@ts-ignore
  newShape.setLocalPose(transform)
  return newShape
}

const getGeometry = ({ shape, transform, options }): PhysX.PxGeometry => {
  const { boxExtents, radius, vertices, indices, halfHeight } = options || {}
  let geometry: PhysX.PxGeometry
  switch (shape) {
    case SHAPES.Box:
      geometry = new PhysX.PxBoxGeometry(boxExtents.x, boxExtents.y, boxExtents.z)
      break
    case SHAPES.Sphere:
      geometry = new PhysX.PxSphereGeometry(radius)
      break
    case SHAPES.Capsule:
      geometry = new PhysX.PxCapsuleGeometry(radius, halfHeight)
      break
    case SHAPES.Plane:
      geometry = new PhysX.PxPlaneGeometry()
      break
    case SHAPES.TriangleMesh:
      geometry = createTrimesh(
        transform,
        PhysXManager.instance.cooking,
        PhysXManager.instance.physics,
        vertices,
        indices
      )
      break
    default:
    case SHAPES.ConvexMesh:
      geometry = createConvexMesh(transform, PhysXManager.instance.cooking, PhysXManager.instance.physics, vertices)
      break
  }
  return geometry
}

const createTrimesh = (
  transform: TransformType,
  cooking: PhysX.PxCooking,
  physics: PhysX.PxPhysics,
  vertices: ArrayLike<number>,
  indices: ArrayLike<number>
): PhysX.PxTriangleMeshGeometry => {
  const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)
  const indicesPtr = putIntoPhysXHeap(PhysX.HEAPF32, indices)
  const trimesh = cooking.createTriMesh(
    verticesPtr,
    vertices.length / 3,
    indicesPtr,
    indices.length / 3,
    false,
    physics
  )

  if (trimesh === null) return

  const meshScale = new PhysX.PxMeshScale(
    { x: transform.scale.x, y: transform.scale.y, z: transform.scale.z },
    // { x: 1, y: 1, z: 1 },
    { x: 0, y: 0, z: 0, w: 1 }
  )
  const geometry = new PhysX.PxTriangleMeshGeometry(trimesh, meshScale, new PhysX.PxMeshGeometryFlags(0))

  PhysX._free(verticesPtr)
  PhysX._free(indicesPtr)

  return geometry
}

const createConvexMesh = (
  transform: TransformType,
  cooking: PhysX.PxCooking,
  physics: PhysX.PxPhysics,
  vertices: ArrayLike<number>
): PhysX.PxTriangleMeshGeometry => {
  const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)

  const convexMesh = cooking.createConvexMesh(verticesPtr, vertices.length / 3, physics)

  const meshScale = new PhysX.PxMeshScale(
    { x: transform.scale.x, y: transform.scale.y, z: transform.scale.z },
    // { x: 1, y: 1, z: 1 },
    { x: 0, y: 0, z: 0, w: 1 }
  )
  const geometry = new PhysX.PxConvexMeshGeometry(convexMesh, meshScale, new PhysX.PxConvexMeshGeometryFlags(0))

  PhysX._free(verticesPtr)

  return geometry
}
