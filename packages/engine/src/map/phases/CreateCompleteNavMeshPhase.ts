import { Store } from '../functions/createStore'
import { NavMeshBuilder } from '../NavMeshBuilder'
import { TileKey } from '../types'
export const name = 'create complete navigation mesh'
export const isAsyncPhase = false
export const isCachingPhase = false

const builder = new NavMeshBuilder()

export function getTaskKeys(_: Store) {
  return [null]
}

export function execTask(store: Store, _: TileKey) {
  for (const value of store.tileNavMeshCache.values()) {
    builder.addGeometry({ type: 'MultiPolygon', coordinates: value })
  }
  return builder.build(store.navMesh)
}

export function cleanup(_: Store) {
  builder.reset()
}
