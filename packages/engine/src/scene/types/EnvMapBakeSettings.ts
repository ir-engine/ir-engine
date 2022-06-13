import { Vector3 } from 'three'

import { EnvMapBakeRefreshTypes } from './EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from './EnvMapBakeTypes'

export type EnvMapBakeSettings = {
  bakePosition: Vector3
  bakePositionOffset?: Vector3
  bakeScale?: Vector3
  bakeType: EnvMapBakeTypes
  resolution: number
  refreshMode: EnvMapBakeRefreshTypes
  envMapOrigin: string
  boxProjection: boolean
}
