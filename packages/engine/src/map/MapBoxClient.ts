import { VectorTile } from '@mapbox/vector-tile'
import { degreesToRadians } from '@turf/turf'
import { Config } from '@xrengine/common/src/config'
import { Feature, Position } from 'geojson'
import { sceneToLl } from './MeshBuilder'
import { LongLat, TileFeaturesByLayer } from './types'
import { vectors } from './vectors'

// TODO try higher zoom levels
export const TILE_ZOOM = 16
export const NUMBER_OF_TILES_PER_DIMENSION = 3
const WHOLE_NUMBER_OF_TILES_FROM_CENTER = Math.floor(NUMBER_OF_TILES_PER_DIMENSION / 2)
const NUMBER_OF_TILES_IS_ODD = NUMBER_OF_TILES_PER_DIMENSION % 2

export const RASTER_TILE_SIZE_HDPI = 256

const MAX_SIZE_CACHED_TILES = 16
/** ordered by time last used, ascending */
const $cachedTiles = new Map<[number, number], TileFeaturesByLayer>()

export function long2TileFraction(lon: number, zoom: number) {
  return ((lon + 180) / 360) * Math.pow(2, zoom)
}

export function lat2TileFraction(lat: number, zoom: number) {
  const latRadians = degreesToRadians(lat)

  return ((1 - Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI) / 2) * Math.pow(2, zoom)
}

export function long2tile(lon: number, zoom: number) {
  return Math.floor(long2TileFraction(lon, zoom))
}

export function lat2tile(lat: number, zoom: number) {
  return Math.floor(lat2TileFraction(lat, zoom))
}

export function tile2long(tileX: number, zoom: number) {
  return (tileX / Math.pow(2, zoom)) * 360 - 180
}

export function tile2lat(tileY: number, zoom: number) {
  return Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / Math.pow(2, zoom)))) * (180 / Math.PI)
}

/**
 * Return the features we care about from a tiles
 * Full list of layers with explanations: https://docs.mapbox.com/vector-tiles/reference/mapbox-streets-v8/
 */
function vectorTile2GeoJSON(tile: VectorTile, [tileX, tileY]: Position): TileFeaturesByLayer {
  const result: TileFeaturesByLayer = {
    building: [],
    road: [],
    water: [],
    waterway: [],
    landuse: []
  }
  Object.keys(result).forEach((layerName) => {
    const vectorLayer = tile.layers[layerName]

    if (!vectorLayer) return

    for (let i = 0; i < vectorLayer.length; i++) {
      const feature: Feature = vectorLayer.feature(i).toGeoJSON(tileX, tileY, TILE_ZOOM)
      feature.properties.uuid = `${layerName},${tileX},${tileY},${i}`
      result[layerName].push(feature)
    }
  })
  return result
}

/**
 * @param highDpi only applicable to raster tiles
 */
export function getMapBoxUrl(layerId: string, tileX: number, tileY: number, format: string, highDpi = false) {
  return `https://api.mapbox.com/v4/${layerId}/${TILE_ZOOM}/${tileX}/${tileY}${
    highDpi ? '@2x' : ''
  }.${format}?access_token=${Config.publicRuntimeConfig.MAPBOX_API_KEY}`
}

async function fetchTile(tileX: number, tileY: number): Promise<TileFeaturesByLayer> {
  const url = getMapBoxUrl('mapbox.mapbox-streets-v8', tileX, tileY, 'vector.pbf')
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve) => {
    vectors(blob, (rawTile: VectorTile) => {
      const tile = vectorTile2GeoJSON(rawTile, [tileX, tileY])
      $cachedTiles.set([tileX, tileY], tile)
      resolve(tile)
    })
  })
}

async function fetchRasterTile(tileX: number, tileY: number): Promise<ImageBitmap> {
  const url = getMapBoxUrl('mapbox.satellite', tileX, tileY, 'png')

  const response = await fetch(url)
  const blob = await response.blob()
  return createImageBitmap(blob)
}

export function createIntersectTestTileCircle(centerX: number, centerY: number, radius: number) {
  return function isIntersectTileCircle(cellX: number, cellY: number): boolean {
    const testEdgeX = centerX < cellX ? cellX : centerX > cellX + 1 ? cellX + 1 : centerX
    const testEdgeY = centerY < cellY ? cellY : centerY > cellY + 1 ? cellY + 1 : centerY
    const distanceFromCenter = Math.hypot(testEdgeX - centerX, testEdgeY - centerY)

    return distanceFromCenter < radius
  }
}

export function* createTileIterator(
  center: LongLat,
  minimumSceneRadius: number,
  zoomLevel: number
): Generator<[number, number]> {
  const [startLong, startLat] = sceneToLl([-minimumSceneRadius, -minimumSceneRadius], center)
  const [endLong, endLat] = sceneToLl([minimumSceneRadius, minimumSceneRadius], center)

  const centerX = long2TileFraction(center[0], zoomLevel)
  const centerY = lat2TileFraction(center[1], zoomLevel)

  const startTileFractionX = long2TileFraction(startLong, zoomLevel)
  const endTileFractionX = long2TileFraction(endLong, zoomLevel)
  const startTileFractionY = lat2TileFraction(startLat, zoomLevel)
  const endTileFractionY = lat2TileFraction(endLat, zoomLevel)

  const startTileX = Math.floor(startTileFractionX)
  const endTileX = Math.floor(endTileFractionX)
  const startTileY = Math.floor(startTileFractionY)
  const endTileY = Math.floor(endTileFractionY)

  const radiusTiles = (endTileFractionX - startTileFractionX) / 2
  const isIntersectTileCircle = createIntersectTestTileCircle(centerX, centerY, radiusTiles)

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      if (isIntersectTileCircle(tileX, tileY)) {
        yield [tileX, tileY]
      }
    }
  }
}

function forEachSurroundingTile(llPosition: Position, callback: (tileX: number, tileY: number) => void) {
  const tileX0 = long2tile(llPosition[0], TILE_ZOOM)
  const tileY0 = lat2tile(llPosition[1], TILE_ZOOM)
  const startIndex = -WHOLE_NUMBER_OF_TILES_FROM_CENTER
  const endIndex = NUMBER_OF_TILES_IS_ODD ? WHOLE_NUMBER_OF_TILES_FROM_CENTER : WHOLE_NUMBER_OF_TILES_FROM_CENTER - 1
  for (let i = startIndex; i <= endIndex; i++) {
    for (let j = startIndex; j <= endIndex; j++) {
      const tileX = tileX0 + j
      const tileY = tileY0 + i
      callback(tileX, tileY)
    }
  }
}

export function llToTile(llPosition: Position) {
  const tileX = long2tile(llPosition[0], TILE_ZOOM)
  const tileY = lat2tile(llPosition[1], TILE_ZOOM)
  return [tileX, tileY]
}

/**
 * @returns promise resolving to array containing one array of features per tile
 */
export function fetchVectorTiles(center: LongLat, minimumSceneRadius = 600): Promise<TileFeaturesByLayer[]> {
  const promises = []
  for (const tileCoord of createTileIterator(center, minimumSceneRadius, TILE_ZOOM)) {
    const cachedTile = $cachedTiles.get(tileCoord)
    if (cachedTile) {
      promises.push(Promise.resolve(cachedTile))

      // Update cache, ensuring time-last-used order
      $cachedTiles.delete(tileCoord)
      $cachedTiles.set(tileCoord, cachedTile)
    } else {
      promises.push(fetchTile(...tileCoord))
    }
  }
  evictLeastRecentlyUsedItems($cachedTiles, MAX_SIZE_CACHED_TILES)
  return Promise.all(promises)
}

export function evictLeastRecentlyUsedItems<K, V>(cache: Map<K, V>, maxSize: number) {
  let cachedItemCount = cache.size
  for (const key of cache.keys()) {
    if (cachedItemCount > maxSize) {
      cachedItemCount--
      cache.delete(key)
    }
  }
}

/**
 * @returns promise resolving to array of raster tiles
 */
export function fetchRasterTiles(llCenter: Position): Promise<ImageBitmap[]> {
  const promises = []
  forEachSurroundingTile(llCenter, (tileX, tileY) => promises.push(fetchRasterTile(tileX, tileY)))
  return Promise.all(promises)
}
