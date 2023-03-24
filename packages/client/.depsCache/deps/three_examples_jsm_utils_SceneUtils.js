import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  InstancedBufferAttribute,
  Matrix4,
  Mesh,
  Vector3
} from "./chunk-FQAJRN7P.js";
import "./chunk-TFWDKVI3.js";

// ../../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
function deepCloneAttribute(attribute) {
  if (attribute.isInstancedInterleavedBufferAttribute || attribute.isInterleavedBufferAttribute) {
    return deinterleaveAttribute(attribute);
  }
  if (attribute.isInstancedBufferAttribute) {
    return new InstancedBufferAttribute().copy(attribute);
  }
  return new BufferAttribute().copy(attribute);
}
function deinterleaveAttribute(attribute) {
  const cons = attribute.data.array.constructor;
  const count = attribute.count;
  const itemSize = attribute.itemSize;
  const normalized = attribute.normalized;
  const array = new cons(count * itemSize);
  let newAttribute;
  if (attribute.isInstancedInterleavedBufferAttribute) {
    newAttribute = new InstancedBufferAttribute(array, itemSize, normalized, attribute.meshPerAttribute);
  } else {
    newAttribute = new BufferAttribute(array, itemSize, normalized);
  }
  for (let i = 0; i < count; i++) {
    newAttribute.setX(i, attribute.getX(i));
    if (itemSize >= 2) {
      newAttribute.setY(i, attribute.getY(i));
    }
    if (itemSize >= 3) {
      newAttribute.setZ(i, attribute.getZ(i));
    }
    if (itemSize >= 4) {
      newAttribute.setW(i, attribute.getW(i));
    }
  }
  return newAttribute;
}
function mergeGroups(geometry) {
  if (geometry.groups.length === 0) {
    console.warn("THREE.BufferGeometryUtils.mergeGroups(): No groups are defined. Nothing to merge.");
    return geometry;
  }
  let groups = geometry.groups;
  groups = groups.sort((a, b) => {
    if (a.materialIndex !== b.materialIndex)
      return a.materialIndex - b.materialIndex;
    return a.start - b.start;
  });
  if (geometry.getIndex() === null) {
    const positionAttribute = geometry.getAttribute("position");
    const indices = [];
    for (let i = 0; i < positionAttribute.count; i += 3) {
      indices.push(i, i + 1, i + 2);
    }
    geometry.setIndex(indices);
  }
  const index = geometry.getIndex();
  const newIndices = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const groupStart = group.start;
    const groupLength = groupStart + group.count;
    for (let j = groupStart; j < groupLength; j++) {
      newIndices.push(index.getX(j));
    }
  }
  geometry.dispose();
  geometry.setIndex(newIndices);
  let start = 0;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    group.start = start;
    start += group.count;
  }
  let currentGroup = groups[0];
  geometry.groups = [currentGroup];
  for (let i = 1; i < groups.length; i++) {
    const group = groups[i];
    if (currentGroup.materialIndex === group.materialIndex) {
      currentGroup.count += group.count;
    } else {
      currentGroup = group;
      geometry.groups.push(currentGroup);
    }
  }
  return geometry;
}

// ../../node_modules/three/examples/jsm/utils/SceneUtils.js
var _color = new Color();
var _matrix = new Matrix4();
function createMeshesFromInstancedMesh(instancedMesh) {
  const group = new Group();
  const count = instancedMesh.count;
  const geometry = instancedMesh.geometry;
  const material = instancedMesh.material;
  for (let i = 0; i < count; i++) {
    const mesh = new Mesh(geometry, material);
    instancedMesh.getMatrixAt(i, mesh.matrix);
    mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    group.add(mesh);
  }
  group.copy(instancedMesh);
  group.updateMatrixWorld();
  return group;
}
function createMeshesFromMultiMaterialMesh(mesh) {
  if (Array.isArray(mesh.material) === false) {
    console.warn("THREE.SceneUtils.createMeshesFromMultiMaterialMesh(): The given mesh has no multiple materials.");
    return mesh;
  }
  const object = new Group();
  object.copy(mesh);
  const geometry = mergeGroups(mesh.geometry);
  const index = geometry.index;
  const groups = geometry.groups;
  const attributeNames = Object.keys(geometry.attributes);
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const start = group.start;
    const end = start + group.count;
    const newGeometry = new BufferGeometry();
    const newMaterial = mesh.material[group.materialIndex];
    for (let j = 0; j < attributeNames.length; j++) {
      const name = attributeNames[j];
      const attribute = geometry.attributes[name];
      const itemSize = attribute.itemSize;
      const newLength = group.count * itemSize;
      const type = attribute.array.constructor;
      const newArray = new type(newLength);
      const newAttribute = new BufferAttribute(newArray, itemSize);
      for (let k = start, n = 0; k < end; k++, n++) {
        const ind = index.getX(k);
        if (itemSize >= 1)
          newAttribute.setX(n, attribute.getX(ind));
        if (itemSize >= 2)
          newAttribute.setY(n, attribute.getY(ind));
        if (itemSize >= 3)
          newAttribute.setZ(n, attribute.getZ(ind));
        if (itemSize >= 4)
          newAttribute.setW(n, attribute.getW(ind));
      }
      newGeometry.setAttribute(name, newAttribute);
    }
    const newMesh = new Mesh(newGeometry, newMaterial);
    object.add(newMesh);
  }
  return object;
}
function createMultiMaterialObject(geometry, materials) {
  const group = new Group();
  for (let i = 0, l = materials.length; i < l; i++) {
    group.add(new Mesh(geometry, materials[i]));
  }
  return group;
}
function reduceVertices(object, func, initialValue) {
  let value = initialValue;
  const vertex = new Vector3();
  object.updateWorldMatrix(true, true);
  object.traverseVisible((child) => {
    const { geometry } = child;
    if (geometry !== void 0) {
      const { position } = geometry.attributes;
      if (position !== void 0) {
        for (let i = 0, l = position.count; i < l; i++) {
          if (child.isMesh) {
            child.getVertexPosition(i, vertex);
          } else {
            vertex.fromBufferAttribute(position, i);
          }
          if (!child.isSkinnedMesh) {
            vertex.applyMatrix4(child.matrixWorld);
          }
          value = func(value, vertex);
        }
      }
    }
  });
  return value;
}
function sortInstancedMesh(mesh, compareFn) {
  const instanceMatrixRef = deepCloneAttribute(mesh.instanceMatrix);
  const instanceColorRef = mesh.instanceColor ? deepCloneAttribute(mesh.instanceColor) : null;
  const attributeRefs = /* @__PURE__ */ new Map();
  for (const name in mesh.geometry.attributes) {
    const attribute = mesh.geometry.attributes[name];
    if (attribute.isInstancedBufferAttribute) {
      attributeRefs.set(attribute, deepCloneAttribute(attribute));
    }
  }
  const tokens = [];
  for (let i = 0; i < mesh.count; i++)
    tokens.push(i);
  tokens.sort(compareFn);
  for (let i = 0; i < tokens.length; i++) {
    const refIndex = tokens[i];
    _matrix.fromArray(instanceMatrixRef.array, refIndex * mesh.instanceMatrix.itemSize);
    _matrix.toArray(mesh.instanceMatrix.array, i * mesh.instanceMatrix.itemSize);
    if (mesh.instanceColor) {
      _color.fromArray(instanceColorRef.array, refIndex * mesh.instanceColor.itemSize);
      _color.toArray(mesh.instanceColor.array, i * mesh.instanceColor.itemSize);
    }
    for (const name in mesh.geometry.attributes) {
      const attribute = mesh.geometry.attributes[name];
      if (attribute.isInstancedBufferAttribute) {
        const attributeRef = attributeRefs.get(attribute);
        attribute.setX(i, attributeRef.getX(refIndex));
        if (attribute.itemSize > 1)
          attribute.setY(i, attributeRef.getY(refIndex));
        if (attribute.itemSize > 2)
          attribute.setZ(i, attributeRef.getZ(refIndex));
        if (attribute.itemSize > 3)
          attribute.setW(i, attributeRef.getW(refIndex));
      }
    }
  }
}
export {
  createMeshesFromInstancedMesh,
  createMeshesFromMultiMaterialMesh,
  createMultiMaterialObject,
  reduceVertices,
  sortInstancedMesh
};
//# sourceMappingURL=three_examples_jsm_utils_SceneUtils.js.map
