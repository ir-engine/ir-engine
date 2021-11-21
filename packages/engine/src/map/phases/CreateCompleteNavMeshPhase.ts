import { MapStateUnwrapped } from '../types'
import { NavMeshBuilder } from '../NavMeshBuilder'
import { TileKey } from '../types'
export const name = 'CreateCompleteNavMesh'
export const isAsyncPhase = false
export const isCachingPhase = false

const builder = new NavMeshBuilder()

export function getTaskKeys(_: MapStateUnwrapped) {
  return [null]
}

export function execTask(state: MapStateUnwrapped, _: TileKey) {
  for (const value of state.tileNavMeshCache.values()) {
    builder.addGeometry({ type: 'MultiPolygon', coordinates: value })
  }
  return builder.build(state.navMesh)
}

export function cleanup(_: MapStateUnwrapped) {
  builder.reset()
}

export function reset(_: MapStateUnwrapped) {}
