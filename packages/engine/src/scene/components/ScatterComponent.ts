import { BufferGeometry, Material, Mesh } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export enum ScatterMode {
  GRASS,
  MESH
}

export enum ScatterState {
  UNSTAGED,
  STAGING_SCATTER,
  STAGED,
  SCATTERING,
  SCATTERED
}

export type ScatterComponentType = {
  count: number
  surface: any
  densityMap: string
  mode: ScatterMode
  state: ScatterState
}

export const ScatterComponent = createMappedComponent<ScatterComponentType>('ScatterComponent')
