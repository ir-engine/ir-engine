import { BufferGeometry, Mesh, MeshLambertMaterial } from 'three'
import { IStyles, MAX_Z_INDEX } from '../styles'
import getCachedMaterial from './getCachedMaterial'

export default function createMesh(geometry: BufferGeometry, style: IStyles) {
  const { color, extrude, zIndex } = style

  const materialParams = {
    ...(color?.constant ? { color: color?.constant } : {}),
    vertexColors: color?.builtin_function === 'purple_haze' ? true : false,
    depthTest: extrude !== 'flat'
  }

  const material = getCachedMaterial(MeshLambertMaterial, materialParams)
  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = extrude === 'flat' ? -1 * (MAX_Z_INDEX - zIndex) : Infinity
  return mesh
}
