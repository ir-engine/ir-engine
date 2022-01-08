import { BufferGeometry, Mesh, Quaternion, Vector3 } from 'three'

import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {Object3D} object
 * @return {BufferGeometry}
 */
export function getGeometry(object) {
  let mesh,
    tmp = new BufferGeometry()
  const meshes = getMeshes(object)

  if (meshes.length === 0) return null

  // Apply scale  – it can't easily be applied to a CANNON.Shape later.
  if (meshes.length === 1) {
    const position = new Vector3(),
      quaternion = new Quaternion(),
      scale = new Vector3()
    if (meshes[0].geometry.isBufferGeometry) {
      if (meshes[0].geometry.attributes.position && meshes[0].geometry.attributes.position.itemSize > 2) {
        tmp = meshes[0].geometry
      }
    } else {
      tmp = meshes[0].geometry.clone()
    }
    //tmp.metadata = meshes[0].geometry.metadata;
    meshes[0].updateMatrixWorld()
    meshes[0].matrixWorld.decompose(position, quaternion, scale)
    return tmp.scale(scale.x, scale.y, scale.z)
  }

  // Recursively merge geometry, preserving local transforms.
  const combined = mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))

  // const matrix = new Matrix4();
  // matrix.scale(object.scale);
  // combined.applyMatrix4(matrix);
  return combined
}

function getMeshes(object) {
  const meshes: Mesh[] = []
  object.traverse((o) => {
    if (o.type === 'Mesh' || o.type === 'SkinnedMesh') {
      meshes.push(o)
    }
  })
  return meshes
}
