import { Matrix4, Quaternion, Vector3 } from 'three';
import { Transform, PhysXModelShapes } from './types/ThreePhysX';
import { PhysXManager } from './worker';

const quat1 = new Quaternion();
const quat2 = new Quaternion();
const vec3 = new Vector3();
const zVec = new Vector3(0, 0, 1);
const halfPI = Math.PI / 2;

export const getShape = ({ shape, transform, options }): PhysX.PxShape => {
  const geometry = getGeometry({ shape, transform, options });
  if (!geometry) return;

  const material = PhysXManager.instance.physics.createMaterial(0.2, 0.2, 0.2);
  const flags = new PhysX.PxShapeFlags(PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value | PhysX.PxShapeFlag.eSIMULATION_SHAPE.value);

  const newShape = PhysXManager.instance.physics.createShape(geometry, material, false, flags);
  // rotate 90 degrees on Z axis as PhysX capsule extend along X axis not the Y axis
  if (shape === PhysXModelShapes.Capsule) {
    quat1.setFromAxisAngle(zVec, halfPI);
    quat2.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
    quat2.multiply(quat1);
    transform.rotation = {
      x: quat2.x,
      y: quat2.y,
      z: quat2.z,
      w: quat2.w,
    };
  }
  //@ts-ignore
  newShape.setLocalPose(transform);
  return newShape;
};

const getGeometry = ({ shape, transform, options }): PhysX.PxGeometry => {
  const { boxExtents, radius, vertices, indices, halfHeight } = options || {};
  let geometry: PhysX.PxGeometry;
  switch (shape) {
    case PhysXModelShapes.Box:
      geometry = new PhysX.PxBoxGeometry(boxExtents.x, boxExtents.y, boxExtents.z);
      break;
    case PhysXModelShapes.Sphere:
      geometry = new PhysX.PxSphereGeometry(radius);
      break;
    case PhysXModelShapes.Capsule:
      geometry = new PhysX.PxCapsuleGeometry(radius, halfHeight);
      break;
    case PhysXModelShapes.Plane:
      geometry = new PhysX.PxPlaneGeometry();
      break;
    case PhysXModelShapes.TriangleMesh:
      geometry = createTrimesh(transform, PhysXManager.instance.cooking, PhysXManager.instance.physics, vertices, indices);
      break;
    default:
    case PhysXModelShapes.ConvexMesh:
      geometry = createConvexMesh(transform, PhysXManager.instance.cooking, PhysXManager.instance.physics, vertices);
      break;
  }
  return geometry;
};

const createTrimesh = (transform: Transform, cooking: PhysX.PxCooking, physics: PhysX.PxPhysics, vertices: ArrayLike<number>, indices: ArrayLike<number>): PhysX.PxTriangleMeshGeometry => {
  const verticesPtr = createArrayPointers(vertices);
  const indicesPtr = createArrayPointers(indices);
  const trimesh = cooking.createTriMesh(verticesPtr, vertices.length / 3, indicesPtr, indices.length / 3, false, physics);

  if (trimesh === null) return;

  const meshScale = new PhysX.PxMeshScale(
    { x: transform.scale.x, y: transform.scale.y, z: transform.scale.z },
    // { x: 1, y: 1, z: 1 },
    { x: 0, y: 0, z: 0, w: 1 },
  );
  const geometry = new PhysX.PxTriangleMeshGeometry(trimesh, meshScale, new PhysX.PxMeshGeometryFlags(0));

  PhysX._free(verticesPtr);
  PhysX._free(indicesPtr);

  return geometry;
};

const createConvexMesh = (transform: Transform, cooking: PhysX.PxCooking, physics: PhysX.PxPhysics, vertices: ArrayLike<number>): PhysX.PxTriangleMeshGeometry => {
  const verticesPtr = createArrayPointers(vertices);

  const convexMesh = cooking.createConvexMesh(verticesPtr, vertices.length / 3, physics);

  const meshScale = new PhysX.PxMeshScale(
    { x: transform.scale.x, y: transform.scale.y, z: transform.scale.z },
    // { x: 1, y: 1, z: 1 },
    { x: 0, y: 0, z: 0, w: 1 },
  );
  const geometry = new PhysX.PxConvexMeshGeometry(convexMesh, meshScale, new PhysX.PxConvexMeshGeometryFlags(0));

  PhysX._free(verticesPtr);

  return geometry;
};

const createArrayPointers = (array: ArrayLike<number>) => {
  const ptr = PhysX._malloc(4 * array.length);
  let offset = 0;

  for (let i = 0; i < array.length; i++) {
    PhysX.HEAPF32[(ptr + offset) >> 2] = array[i];
    offset += 4;
  }

  return ptr;
};
