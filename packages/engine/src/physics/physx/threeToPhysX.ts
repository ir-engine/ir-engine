import { Vector3, Matrix4, Mesh, Quaternion, Object3D, SphereGeometry, BufferGeometry } from 'three';
import { PhysXInstance } from '.';
import { PhysXBodyType, PhysXModelShapes, PhysXShapeConfig, RigidBodyProxy, ShapeConfig } from './types/ThreePhysX';

const matrixA = new Matrix4();
const matrixB = new Matrix4();
const pos = new Vector3();
const rot = new Quaternion();
const scale = new Vector3(1, 1, 1);

export const getShapes = (object: any) => {
  const shapes: PhysXShapeConfig[] = [];
  object.updateMatrixWorld(true);
  iterateGeometries(object, { includeInvisible: true }, (data) => {
    shapes.push(...data);
  });
  return shapes;
};

export const createShapeFromConfig = (shape) => {
  const transform = shape.transform || createNewTransform();
  const id = PhysXInstance.instance._getNextAvailableShapeID();
  shape.id = id;
  shape.transform = transform;
  shape.config = getShapeConfig(shape ?? {});
  shape.config.id = id;
  return shape;
}

const createShapes = (mesh, root): PhysXShapeConfig[] => {
  if (!mesh.userData.physx) {
    mesh.userData.physx = {};
  }
  const shapes: PhysXShapeConfig[] = [];
  if (mesh.userData.physx.shapes) {
    const relativeTransform = getTransformRelativeToRoot(mesh, root);
    mesh.userData.physx.shapes.forEach((shape) => {
      const data = getShapeData(mesh, shape);
      if (!data) return;
      const transform = shape.transform || relativeTransform;
      const id = PhysXInstance.instance._getNextAvailableShapeID();
      data.id = id;
      data.transform = transform;
      data.config = getShapeConfig(shape ?? {});
      data.config.id = id;
      shapes.push(data);
    });
  } 
  else {
    const data = getThreeGeometryShape(mesh);
    if (!data) return [];
    const transform = getTransformRelativeToRoot(mesh, root);
    const id = PhysXInstance.instance._getNextAvailableShapeID();
    data.id = id;
    data.transform = transform;
    data.config = getShapeConfig({});
    data.config.id = id;
    shapes.push(data);
  }
  return shapes;
};

// from three-to-ammo
export const iterateGeometries = (function () {
  return function (root, options, cb) {
    root.traverse((mesh: Mesh) => {
      if (mesh.isMesh && (options.includeInvisible || mesh.visible)) {
        cb(createShapes(mesh, root));
      }
    });
  };
})();

const getShapeConfig = (data) => {
  return {
    isTrigger: data.isTrigger,
    collisionLayer: data.collisionLayer,
    collisionMask: data.collisionMask,
    material: data.material,
  };
};

const getShapeData = (mesh, shape): any => {
  if (!shape.type) {
    return getThreeGeometryShape(mesh);
  }
  switch (shape.type) {
    case PhysXModelShapes.Box:
      return {
        shape: shape.type,
        options: { boxExtents: shape.boxExtents || getBoxExtents(mesh) },
      };
    case PhysXModelShapes.Capsule:
      return {
        shape: shape.type,
        halfHeight: shape.halfHeight ?? 1,
        radius: shape.radius ?? shape.radiusTop ?? 0.5,
      };
    case PhysXModelShapes.Sphere:
      return {
        shape: shape.type,
        options: { radius: shape.sphereRadius || getSphereRadius(mesh) },
      };
    case PhysXModelShapes.ConvexMesh:
      const vertices = Array.from(mesh.geometry.attributes.position.array);
      return { shape: shape.type, options: { vertices } };
    case PhysXModelShapes.TriangleMesh:
    default: {
      // const vertices = removeDuplicates(Array.from(mesh.geometry.attributes.position.array));
      const vertices = Array.from(mesh.geometry.attributes.position.array);
      const indices = mesh.geometry.index ? Array.from(mesh.geometry.index.array) : Object.keys(vertices).map(Number);
      return { shape: shape.type, options: { vertices, indices } };
    }
  }
};

const getThreeGeometryShape = (mesh): any => {
  if (!mesh.geometry) throw new Error('No geometry defined!');
  switch (mesh.geometry.type) {
    case 'BoxGeometry':
    case 'BoxBufferGeometry':
      return {
        shape: PhysXModelShapes.Box,
        options: { boxExtents: getBoxExtents(mesh) },
      };
    case 'CapsuleBufferGeometry': // https://github.com/maximeq/three-js-capsule-geometry
      return {
        shape: PhysXModelShapes.Capsule,
        options: { halfHeight: mesh.geometry._halfHeight ?? 1, radius: mesh.geometry.radius ?? mesh.geometry.radiusTop ?? 0.5 },
      };
    case 'SphereGeometry':
    case 'SphereBufferGeometry':
      return {
        shape: PhysXModelShapes.Sphere,
        options: { radius: getSphereRadius(mesh) },
      };
    case 'ConvexGeometry': {
      const vertices = Array.from(mesh.geometry.attributes.position.array);
      return { shape: PhysXModelShapes.ConvexMesh, options: { vertices } };
    }
    default:
      // console.log('threeToPhysX: geometry of type', mesh.geometry.type, 'not supported. No shape will be added.');
      // return;
      const vertices = Array.from(mesh.geometry.attributes.position.array);
      return {
        shape: PhysXModelShapes.ConvexMesh,
        options: { vertices },
      };
  }
};

const getSphereRadius = function (mesh: Mesh) {
  const scale = mesh.getWorldScale(pos).lengthSq() / 3;
  return ((mesh.geometry as SphereGeometry)?.parameters?.radius || 1) * scale;
};

const getBoxExtents = function (mesh: Mesh) {
  const worldScale = mesh.getWorldScale(scale);
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  return {
    x: ((box.max.x - box.min.x) / 2) * worldScale.x,
    y: ((box.max.y - box.min.y) / 2) * worldScale.y,
    z: ((box.max.z - box.min.z) / 2) * worldScale.z,
  };
};
const matrix = new Matrix4();
export const getTransformFromWorldPos = (obj: Object3D) => {
  obj.matrixWorld.decompose(pos, rot, scale);
  return {
    translation: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    scale: { x: scale.x, y: scale.y, z: scale.z },
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
  };
};

export const createNewTransform = () => {
  return {
    translation: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
    linearVelocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
  };
};

const getTransformRelativeToRoot = (mesh: Object3D, root: Object3D) => {
  // console.log(mesh, root)
  const worldScale = root.getWorldScale(scale);
  // console.log(worldScale)
  // no local transformation
  if (mesh === root) {
    return {
      translation: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: worldScale.x, y: worldScale.y, z: worldScale.z },
    };
  }

  // local transformation
  if (mesh.parent === root) {
    return {
      translation: {
        x: mesh.position.x,
        y: mesh.position.y,
        z: mesh.position.z,
      },
      rotation: {
        x: mesh.quaternion.x,
        y: mesh.quaternion.y,
        z: mesh.quaternion.z,
        w: mesh.quaternion.w,
      },
      scale: { x: worldScale.x, y: worldScale.y, z: worldScale.z },
    };
  }
  mesh.updateMatrixWorld(true);
  mesh.updateWorldMatrix(true, true);

  // world transformation
  matrixB.copy(mesh.matrixWorld);
  matrixA.copy(root.matrixWorld).invert();
  matrixB.premultiply(matrixA);

  matrixB.decompose(pos, rot, scale);
  // scale.multiply(root.scale)
  return {
    translation: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    scale: { x: scale.x, y: scale.y, z: scale.z },
  };
};

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {Object3D} object
 * @return {BufferGeometry}
 */
export function getGeometry(object) {
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
      if (meshes[0].geometry.attributes.position && meshes[0].geometry.attributes.position.itemSize > 2) {
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
      if (mesh.geometry.attributes.position && mesh.geometry.attributes.position.itemSize > 2) {
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

function getMeshes(object) {
  const meshes = [];
  object.traverse((o) => {
    if (o.type === 'Mesh') {
      meshes.push(o);
    }
  });
  return meshes;
}

const removeDuplicates = (verticesIn: number[]) => {
  const vertices: Vector3[] = [];
  for (let i = 0; i < verticesIn.length; i += 3) {
    const newVec = new Vector3(verticesIn[i], verticesIn[i + 1], verticesIn[i + 2]);
    let exists = false;
    for (const vert of vertices) {
      if (vert.equals(newVec)) {
        exists = true;
      }
    }
    if (!exists) {
      vertices.push(newVec);
    }
  }
  const verticesOut = [];
  vertices.forEach((vert) => {
    verticesOut.push(vert.x, vert.y, vert.z);
  });
  return verticesOut;
};
