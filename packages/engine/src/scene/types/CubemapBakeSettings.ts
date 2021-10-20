import { Vector3 } from 'three'
import { CubemapBakeRefreshTypes } from './CubemapBakeRefreshTypes'
import { CubemapBakeTypes } from './CubemapBakeTypes'

export type CubemapBakeSettings = {
  bakePosition: Vector3
  bakePositionOffset?: Vector3
  bakeScale?: Vector3
  bakeType: CubemapBakeTypes
  resolution: number
  refreshMode: CubemapBakeRefreshTypes
  envMapOrigin: string
  boxProjection: boolean
}
