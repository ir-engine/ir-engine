import { TaskStatus, TileKey } from '../types'
import { Store } from '../functions/createStore'
import { tileXToLong, tileYToLat, toMetersFromCenter } from '../units'
import { TILE_ZOOM } from '../constants'
import { DEFAULT_FEATURE_STYLES, getFeatureStyles, MAX_Z_INDEX } from '../styles'
import getCachedMaterial from '../functions/getCachedMaterial'
import { Mesh, MeshLambertMaterial, PlaneBufferGeometry } from 'three'

export const name = 'create fallback landuse mesh'
export const isAsyncPhase = false
export const isCachingPhase = false

export function getTaskKeys(store: Store) {
  return store.tileCache.keys()
}

export function execTask(store: Store, key: TileKey) {
  const [x, y] = key

  const [tileLeft, tileTop] = toMetersFromCenter(
    [tileXToLong(x, TILE_ZOOM), tileYToLat(y, TILE_ZOOM)],
    store.originalCenter
  )
  const [tileRight, tileBottom] = toMetersFromCenter(
    [tileXToLong(x + 1, TILE_ZOOM), tileYToLat(y + 1, TILE_ZOOM)],
    store.originalCenter
  )

  const tileWidth = tileRight - tileLeft
  const tileHeight = tileBottom - tileTop

  const style = getFeatureStyles(DEFAULT_FEATURE_STYLES, 'landuse')
  const color = style?.color?.constant

  const material = getCachedMaterial(MeshLambertMaterial, { color, depthTest: false })

  const geometry = new PlaneBufferGeometry(tileWidth, tileHeight)

  geometry.rotateX(Math.PI / 2)
  const mesh = new Mesh(geometry, material)
  mesh.renderOrder = -MAX_Z_INDEX
  store.completeObjects.set(['landuse_fallback', x, y, '0'], {
    centerPoint: [tileLeft + tileWidth / 2, -1 * (tileTop + tileHeight / 2)],
    boundingCircleRadius: Math.max(tileWidth, tileHeight),
    mesh
  })
}

export function cleanup(_: Store) {}
