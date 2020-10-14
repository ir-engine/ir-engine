import { Object3D, Geometry, Box3, Vector3, Quaternion, MathUtils, Matrix4, BufferGeometry, Mesh } from 'three';
import { Shape, Box, Vec3, ConvexPolyhedron, Cylinder, Sphere, Trimesh } from 'cannon-es';
import { Quaternion as CANNONQuaternion } from 'cannon-es';
import { quickhull } from './THREE.quickhull';
// TODO: enable tslint
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
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {Object3D} object
 * @param  {Object} options?
 * @return {Shape}
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
  * @param  {Geometry} geometry
  * @return {Shape}
  */
 function createBoxShape (geometry) {
   const vertices = getVertices(geometry);

   if (!vertices.length) return null;

   geometry.computeBoundingBox();
   const box = geometry.boundingBox;
   return new Box(new Vec3(
     (box.max.x - box.min.x) / 2,
     (box.max.y - box.min.y) / 2,
     (box.max.z - box.min.z) / 2
   ));
 }

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {Object3D} object
 * @return {Shape}
 */
function createBoundingBoxShape (object) {
  const box = new Box3();

  const clone = object.clone();
  clone.quaternion.set(0, 0, 0, 1);
  clone.updateMatrixWorld();

  box.setFromObject(clone);

  if (!isFinite(box.min.lengthSq())) return null;

  const shape = new Box(new Vec3(
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
 * @param  {Object3D} object
 * @return {Shape}
 */
function createConvexPolyhedron (object) {
  let i;
  const eps = 1e-4;
  const geometry = getGeometry(object);

  if (!geometry || !geometry.vertices.length) return null;

  // Perturb.
  for (i = 0; i < geometry.vertices.length; i++) {
    geometry.vertices[i].x += (Math.random() - 0.5) * eps;
    geometry.vertices[i].y += (Math.random() - 0.5) * eps;
    geometry.vertices[i].z += (Math.random() - 0.5) * eps;
  }

  // Compute the 3D convex hull.
  const hull = quickhull(geometry);

  // Convert from THREE.Vector3 to CANNON.Vec3.
  const vertices = new Array(hull.vertices.length);
  for (i = 0; i < hull.vertices.length; i++) {
    vertices[i] = new Vec3(hull.vertices[i].x, hull.vertices[i].y, hull.vertices[i].z);
  }

  // Convert from THREE.Face to Array<number>.
  const faces = new Array(hull.faces.length);
  for (i = 0; i < hull.faces.length; i++) {
    faces[i] = [hull.faces[i].a, hull.faces[i].b, hull.faces[i].c];
  }

  return new ConvexPolyhedron({vertices, faces});
}

/**
 * @param  {Geometry} geometry
 * @return {Shape}
 */
function createCylinderShape (geometry) {
  const params = geometry.metadata ? geometry.metadata.parameters : geometry.parameters;
  const shape: any = new Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  );

  // Include metadata for serialization.
  shape._type = Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = params.radiusTop;
  shape.radiusBottom = params.radiusBottom;
  shape.height = params.height;
  shape.numSegments = params.radialSegments;

  shape.orientation = new CANNONQuaternion();
  shape.orientation.setFromEuler(MathUtils.degToRad(90), 0, 0, 'XYZ').normalize();
  return shape;
}

/**
 * @param  {Object3D} object
 * @param  options
 * @return {Shape}
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
  const shape: any = new Cylinder(radius, radius, height, 12);

  // Include metadata for serialization.
  shape._type = Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = radius;
  shape.radiusBottom = radius;
  shape.height = height;
  shape.numSegments = 12;

  shape.orientation = new CANNONQuaternion();
  shape.orientation.setFromEuler(
    majorAxis === 'y' ? PI_2 : 0,
    majorAxis === 'z' ? PI_2 : 0,
    0,
    'XYZ'
  ).normalize();
  return shape;
}

/**
 * @param  {Geometry} geometry
 * @return {Shape}
 */
function createPlaneShape (geometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  return new Box(new Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

/**
 * @param  {Geometry} geometry
 * @return {Shape}
 */
function createSphereShape (geometry) {
  const params = geometry.metadata
    ? geometry.metadata.parameters
    : geometry.parameters;
  return new Sphere(params.radius);
}

/**
 * @param  {Object3D} object
 * @param  options
 * @return {Shape}
 */
function createBoundingSphereShape (object, options) {
  if (options.sphereRadius) {
    return new Sphere(options.sphereRadius);
  }
  const geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return new Sphere(geometry.boundingSphere.radius);
}

/**
 * @param  {Geometry} geometry
 * @return {Shape}
 */
function createTrimeshShape (geometry) {
  const vertices = getVertices(geometry);

  if (!vertices.length) return null;

  const indices = Object.keys(vertices).map(Number);
  return new Trimesh(vertices, indices);
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {Object3D} object
 * @return {Geometry}
 */
function getGeometry (object) {
  let mesh,
      tmp = new Geometry();
  const meshes = getMeshes(object);

  const combined = new Geometry();

  if (meshes.length === 0) return null;

  // Apply scale  – it can't easily be applied to a CANNON.Shape later.
  if (meshes.length === 1) {
    const position = new Vector3(),
        quaternion = new Quaternion(),
        scale = new Vector3();
    if (meshes[0].geometry.isBufferGeometry) {
      if (meshes[0].geometry.attributes.position
          && meshes[0].geometry.attributes.position.itemSize > 2) {
        tmp.fromBufferGeometry(meshes[0].geometry);
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
        const tmpGeom = new Geometry();
        tmpGeom.fromBufferGeometry(mesh.geometry);
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
 * @param  {Geometry} geometry
 * @return {Array<number>}
 */
function getVertices (geometry) {
  if (!geometry.attributes) {
    geometry = new BufferGeometry().fromGeometry(geometry);
  }
  return (geometry.attributes.position || {}).array || [];
}

/**
 * Returns a flat array of THREE.Mesh instances from the given object. If
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
