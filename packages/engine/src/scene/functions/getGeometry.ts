/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
