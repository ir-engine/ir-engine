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
