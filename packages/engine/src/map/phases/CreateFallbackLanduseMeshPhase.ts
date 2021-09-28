import { TileKey } from '../types'
import { Store } from '../functions/createStore'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles, MAX_Z_INDEX } from '../styles'
import getCachedMaterial from '../functions/getCachedMaterial'
import { Mesh, MeshLambertMaterial, PlaneBufferGeometry } from 'three'
import computeTileBoundingBox from '../functions/computeTileBoundingBox'

export const name = 'create fallback landuse mesh'
export const isAsyncPhase = false
export const isCachingPhase = false

export function getTaskKeys(store: Store) {
  return store.tileCache.keys()
}

const $tileBBox = Array(4)

export function execTask(store: Store, key: TileKey) {
  const [x, y] = key

  const [tileLeft, tileTop, tileRight, tileBottom] = computeTileBoundingBox(
    x,
    y,
    store.originalCenter,
    $tileBBox as any
  )

  const tileWidth = tileRight - tileLeft
  const tileHeight = tileBottom - tileTop

  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, 'landuse')
  const color = style?.color?.constant

  const material = getCachedMaterial(MeshLambertMaterial, { color, depthTest: false })

  const geometry = new PlaneBufferGeometry(tileWidth, tileHeight)

  geometry.rotateX(-Math.PI / 2)
  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = -MAX_Z_INDEX
  store.completeObjects.set(['landuse_fallback', x, y, '0'], {
    centerPoint: [tileLeft + tileWidth / 2, -1 * (tileTop + tileHeight / 2)],
    boundingCircleRadius: Math.max(tileWidth, tileHeight) / 2,
    mesh
  })
}

export function cleanup(_: Store) {}
