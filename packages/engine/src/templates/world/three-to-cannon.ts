import * as CANNON from 'cannon-es';
import { Box3, BufferGeometry, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';
import { quickhull } from './quickhull';
/* tslint:disable */
const PI_2 = Math.PI / 2;

const Type = {
  BOX: 'Box',
  CYLINDER: 'Cylinder',
  SPHERE: 'Sphere',
  HULL: 'ConvexPolyhedron',
  MESH: 'Trimesh'
};

/**
 * Given a Object3D instance, creates a corresponding CANNON shape.
 * @param  {Object3D} object
 * @return {CANNON.Shape}
 */
export const threeToCannon = function (object, options) {
  options = options || {};

  let geometry;

  if (options.type === Type.BOX) {
    return createBoundingBoxShape(object);
  } else if (options.type === Type.CYLINDER) {
    return createBoundingCylinderShape(object, options);
  } else if (options.type === Type.SPHERE) {
    return createBoundingSphereShape(object, options);
  } else if (options.type === Type.HULL) {
    return createConvexPolyhedron(object);
  } else if (options.type === Type.MESH) {
    geometry = getGeometry(object);
    return geometry ? createTrimeshShape(geometry) : null;
  } else if (options.type) {
    throw new Error( options.type);
  }

  geometry = getGeometry(object);
  if (!geometry) return null;

  const type = geometry.metadata
    ? geometry.metadata.type
    : geometry.type;

  switch (type) {
    case 'BoxGeometry':
    case 'BoxBufferGeometry':
      return createBoxShape(geometry);
    case 'CylinderGeometry':
    case 'CylinderBufferGeometry':
      return createCylinderShape(geometry);
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return createPlaneShape(geometry);
    case 'SphereGeometry':
    case 'SphereBufferGeometry':
      return createSphereShape(geometry);
    case 'TubeGeometry':
    case 'Geometry':
    case 'BufferGeometry':
      return createBoundingBoxShape(object);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
};

threeToCannon.Type = Type;

/******************************************************************************
 * Shape construction
 */

 /**
  * @param  {BufferGeometry} geometry
  * @return {CANNON.Shape}
  */
 function createBoxShape (geometry) {
   const vertices = getVertices(geometry);

   if (!vertices.length) return null;

   geometry.computeBoundingBox();
   const box = geometry.boundingBox;
   return new CANNON.Box(new CANNON.Vec3(
     (box.max.x - box.min.x) / 2,
     (box.max.y - box.min.y) / 2,
     (box.max.z - box.min.z) / 2
   ));
 }

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {Object3D} mesh
 * @return {CANNON.Shape}
 */
function createBoundingBoxShape (object) {
  const box = new Box3();

  const clone = object.clone();
  clone.quaternion.set(0, 0, 0, 1);
  clone.updateMatrixWorld();

  box.setFromObject(clone);

  if (!isFinite(box.min.lengthSq())) return null;

  const shape = new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  ));

  const localPosition = box.translate(clone.position.negate()).getCenter(new Vector3());
  if (localPosition.lengthSq()) {
    (shape as any).offset = localPosition;
  }

  return shape;
}

/**
 * Computes 3D convex hull as a CANNON.ConvexPolyhedron.
 * @param  {Object3D} mesh
 * @return {CANNON.Shape}
 */
function createConvexPolyhedron (object) {
  // TODO: Make sure this is right
  let i;
  const eps = 1e-4;
  const geometry = getGeometry(object);

  if (!geometry || !geometry.attributes.position.count) return null;

  // Perturb.
  for (i = 0; i < geometry.attributes.position.count; i++) {
    geometry.attributes.position[i].x += (Math.random() - 0.5) * eps;
    geometry.attributes.position[i].y += (Math.random() - 0.5) * eps;
    geometry.attributes.position[i].z += (Math.random() - 0.5) * eps;
  }

  // Compute the 3D convex hull.
  const hull = quickhull(geometry);

  // Convert from Vector3 to CANNON.Vec3.
  const verticesIn = hull.getAttribute('position')
  const vertices = new Array(verticesIn.count);
  const index = hull.getIndex();

  for (i = 0; i < verticesIn.count / 3; i++) {
    vertices[i] = new CANNON.Vec3(verticesIn[i*3], verticesIn[i*3+1], verticesIn[i*3+2]);
  }

  // Convert from Face to Array<number>.
  const faces = new Array(index.count);
  for (i = 0; i < index.count / 3; i++) {
    faces[i] = [index[i*3], index[i*3+1], index[i*3+2]];
  }

  return new CANNON.ConvexPolyhedron({vertices, faces});
}

/**
 * @param  {BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createCylinderShape (geometry) {
  const params = geometry.metadata ? geometry.metadata.parameters : geometry.parameters;
  const shape: any = new CANNON.Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  );

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = params.radiusTop;
  shape.radiusBottom = params.radiusBottom;
  shape.height = params.height;
  shape.numSegments = params.radialSegments;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(MathUtils.degToRad(90), 0, 0, 'XYZ').normalize();
  return shape;
}

/**
 * @param  {Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingCylinderShape (object, options) {
  const box = new Box3();
  const axes = ['x', 'y', 'z'];
  const majorAxis = options.cylinderAxis || 'y';
  const minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;

  box.setFromObject(object);

  if (!isFinite(box.min.lengthSq())) return null;

  // Compute cylinder dimensions.
  const height = box.max[majorAxis] - box.min[majorAxis];
  const radius = 0.5 * Math.max(
    box.max[minorAxes[0]] - box.min[minorAxes[0]],
    box.max[minorAxes[1]] - box.min[minorAxes[1]]
  );

  // Create shape.
  const shape: any = new CANNON.Cylinder(radius, radius, height, 12);

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = radius;
  shape.radiusBottom = radius;
  shape.height = height;
  shape.numSegments = 12;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(
    majorAxis === 'y' ? PI_2 : 0,
    majorAxis === 'z' ? PI_2 : 0,
    0,
    'XYZ'
  ).normalize();
  return shape;
}

/**
 * @param  {BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createPlaneShape (geometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

/**
 * @param  {BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createSphereShape (geometry) {
  const params = geometry.metadata
    ? geometry.metadata.parameters
    : geometry.parameters;
  return new CANNON.Sphere(params.radius);
}

/**
 * @param  {Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingSphereShape (object, options) {
  if (options.sphereRadius) {
    return new CANNON.Sphere(options.sphereRadius);
  }
  const geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return new CANNON.Sphere(geometry.boundingSphere.radius);
}

/**
 * @param  {BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createTrimeshShape (geometry) {
  const vertices = getVertices(geometry);

  if (!vertices.length) return null;

  const indices = Object.keys(vertices).map(Number);
  return new CANNON.Trimesh(vertices, indices);
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {Object3D} object
 * @return {BufferGeometry}
 */
function getGeometry (object) {
  let mesh,
      tmp = new BufferGeometry();
  const meshes = getMeshes(object);

  const combined = new BufferGeometry();

  if (meshes.length === 0) return null;

  // Apply scale  – it can't easily be applied to a CANNON.Shape later.
  if (meshes.length === 1) {
    const position = new Vector3(),
        quaternion = new Quaternion(),
        scale = new Vector3();
    if (meshes[0].geometry.isBufferGeometry) {
      if (meshes[0].geometry.attributes.position
          && meshes[0].geometry.attributes.position.itemSize > 2) {
        tmp = meshes[0].geometry;
      }
    } else {
      tmp = meshes[0].geometry.clone();
    }
    //tmp.metadata = meshes[0].geometry.metadata;
    meshes[0].updateMatrixWorld();
    meshes[0].matrixWorld.decompose(position, quaternion, scale);
    return tmp.scale(scale.x, scale.y, scale.z);
  }

  // Recursively merge geometry, preserving local transforms.
  while ((mesh = meshes.pop())) {
    mesh.updateMatrixWorld();
    if (mesh.geometry.isBufferGeometry) {
      if (mesh.geometry.attributes.position
          && mesh.geometry.attributes.position.itemSize > 2) {
        const tmpGeom = mesh.geometry;
        combined.merge(tmpGeom, mesh.matrixWorld);
        tmpGeom.dispose();
      }
    } else {
      combined.merge(mesh.geometry, mesh.matrixWorld);
    }
  }

  const matrix = new Matrix4();
  matrix.scale(object.scale);
  combined.applyMatrix4(matrix);
  return combined;
}

/**
 * @param  {BufferGeometry} geometry
 * @return {Array<number>}
 */
function getVertices (geometry) {
  return (geometry.attributes.position || {}).array || [];
}

/**
 * Returns a flat array of Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 * @param  {Object3D} object
 * @return {Array<Mesh>}
 */
function getMeshes (object) {
  const meshes = [];
  object.traverse((o) => {
    if (o.type === 'Mesh') {
      meshes.push(o);
    }
  });
  return meshes;
}
