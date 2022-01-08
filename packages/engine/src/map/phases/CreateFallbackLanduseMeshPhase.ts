import { Mesh, MeshLambertMaterial, PlaneBufferGeometry } from 'three'

import FeatureKey from '../classes/FeatureKey'
import computeTileBoundingBox from '../functions/computeTileBoundingBox'
import getCachedMaterial from '../functions/getCachedMaterial'
import { DEFAULT_FEATURE_STYLES, MAX_Z_INDEX, getFeatureStyles } from '../styles'
import { MapStateUnwrapped, TileKey } from '../types'

export const name = 'CreateFallbackLanduseMesh'
export const isAsyncPhase = false
export const isCachingPhase = false

export function getTaskKeys(state: MapStateUnwrapped) {
  return state.tileCache.keys()
}

const $tileBBox = Array(4)

export function execTask(state: MapStateUnwrapped, key: TileKey) {
  const [x, y] = key

  const [tileLeft, tileTop, tileRight, tileBottom] = computeTileBoundingBox(
    x,
    y,
    state.originalCenter,
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
  state.completeObjects.set(new FeatureKey('landuse_fallback', x, y, '0'), {
    centerPoint: [tileLeft + tileWidth / 2, -1 * (tileTop + tileHeight / 2)],
    boundingCircleRadius: Math.max(tileWidth, tileHeight) / 2,
    mesh
  })
}

export function cleanup(_: MapStateUnwrapped) {}

export function reset(_: MapStateUnwrapped) {}
