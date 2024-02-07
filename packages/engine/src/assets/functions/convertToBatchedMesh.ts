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

import { Material, Mesh } from 'three'
import { BatchedMesh } from 'three/examples/jsm/objects/BatchedMesh'

export function convertToBatchedMesh(meshes: Mesh[]) {
  const numMeshes = meshes.length
  const totalVertices = meshes.map((mesh) => mesh.geometry.attributes['position'].count).reduce((x, y) => x + y)
  const totalIndices = meshes.map((mesh) => mesh.geometry.index!.count).reduce((x, y) => x + y)
  const material = meshes[0].material
  const result = new BatchedMesh(numMeshes, totalVertices, totalIndices, material)
  meshes.map((mesh) => {
    const geoId = result.addGeometry(mesh.geometry)
    result.setMatrixAt(geoId, mesh.matrixWorld)
  })
  return result
}

export function convertToBatchedMeshMat(meshes: Mesh[], material: Material): BatchedMesh {
  const numMeshes = meshes.length
  const totalVertices = meshes.map((mesh) => mesh.geometry.attributes['position'].count).reduce((x, y) => x + y)
  const totalIndices = meshes.map((mesh) => mesh.geometry.index!.count).reduce((x, y) => x + y)
  //const material = meshes[0].material
  const result = new BatchedMesh(numMeshes, totalVertices, totalIndices, material)
  meshes.map((mesh) => {
    const geoId = result.addGeometry(mesh.geometry)
    result.setMatrixAt(geoId, mesh.matrixWorld)
  })
  return result
}
