import { BufferGeometry } from 'three'
import {
  ConeShapeJSON,
  DonutShapeJSON,
  GridShapeJSON,
  MeshShapeJSON,
  PointShapeJSON,
  SphereShapeJSON
} from '../../types/particle-system'

export const POINT_SHAPE_DEFAULT: PointShapeJSON = {
  type: 'point'
}

export const SPHERE_SHAPE_DEFAULT: SphereShapeJSON = {
  type: 'sphere',
  radius: 1
}

export const CONE_SHAPE_DEFAULT: ConeShapeJSON = {
  type: 'cone',
  radius: 1,
  arc: 0.2,
  thickness: 4,
  angle: 30
}

export const DONUT_SHAPE_DEFAULT: DonutShapeJSON = {
  type: 'donut',
  radius: 1,
  arc: 30,
  thickness: 0.5,
  angle: 15
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh_surface',
  mesh: '',
  geometry: new BufferGeometry()
}

export const GRID_SHAPE_DEFAULT: GridShapeJSON = {
  type: 'grid',
  width: 1,
  height: 1,
  column: 1,
  row: 1
}
