import { ILayerName, TileFeaturesByLayer } from './types'
import { VectorTile } from '@mapbox/vector-tile'
import { Feature, Position } from 'geojson'
import { Config } from '@xrengine/client-core/src/helper'
import { vectors } from './vectors'

const TILE_ZOOM = 16
const LAYERS: ILayerName[] = ['building', 'road']
export const NUMBER_OF_TILES_PER_DIMENSION = 3
const WHOLE_NUMBER_OF_TILES_FROM_CENTER = Math.floor(NUMBER_OF_TILES_PER_DIMENSION / 2)
const NUMBER_OF_TILES_IS_ODD = NUMBER_OF_TILES_PER_DIMENSION % 2

export const RASTER_TILE_SIZE_HDPI = 256

function long2tile(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
}

function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  )
}

/**
 * Return the features we care about from a tiles
 */
function vectorTile2GeoJSON(tile: VectorTile, [tileX, tileY]: Position): TileFeaturesByLayer {
  const result: TileFeaturesByLayer = {
    building: [],
    road: []
  }
  LAYERS.forEach((layerName) => {
    const vectorLayer = tile.layers[layerName]

    if (!vectorLayer) return

    for (let i = 0; i < vectorLayer.length; i++) {
      const feature = vectorLayer.feature(i).toGeoJSON(tileX, tileY, TILE_ZOOM)
      result[layerName].push(feature)
    }
  })
  return result
}

/**
 * @param highDpi only applicable to raster tiles
 */
function getMapBoxUrl(layerId: string, tileX: number, tileY: number, format: string, highDpi = false) {
  return `https://api.mapbox.com/v4/${layerId}/${TILE_ZOOM}/${tileX}/${tileY}${
    highDpi ? '@2x' : ''
  }.${format}?access_token=${Config.publicRuntimeConfig.MAPBOX_API_KEY}`
}

async function fetchTileFeatures(tileX: number, tileY: number): Promise<TileFeaturesByLayer> {
  const url = getMapBoxUrl('mapbox.mapbox-streets-v8', tileX, tileY, 'vector.pbf')
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve) => {
    vectors(blob, (tile: VectorTile) => {
      resolve(vectorTile2GeoJSON(tile, [tileX, tileY]))
    })
  })
}

async function fetchRasterTile(tileX: number, tileY: number): Promise<ImageBitmap> {
  const url = getMapBoxUrl('mapbox.satellite', tileX, tileY, 'png')

  const response = await fetch(url)
  const blob = await response.blob()
  return createImageBitmap(blob)
}

function forEachSurroundingTile(llCenter: Position, callback: (tileX: number, tileY: number) => void) {
  const tileX0 = long2tile(llCenter[0], TILE_ZOOM)
  const tileY0 = lat2tile(llCenter[1], TILE_ZOOM)
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

export function getCenterTile(llCenter: Position) {
  const tileX0 = long2tile(llCenter[0], TILE_ZOOM)
  const tileY0 = lat2tile(llCenter[1], TILE_ZOOM)
  return [tileX0, tileY0]
}

/**
 * @returns promise resolving to array containing one array of features per tile
 */
export function fetchVectorTiles(llCenter: Position): Promise<TileFeaturesByLayer[]> {
  const promises = []
  forEachSurroundingTile(llCenter, (tileX, tileY) => promises.push(fetchTileFeatures(tileX, tileY)))
  return Promise.all(promises)
}

/**
 * @returns promise resolving to array of raster tiles
 */
export function fetchRasterTiles(llCenter: Position): Promise<ImageBitmap[]> {
  const promises = []
  forEachSurroundingTile(llCenter, (tileX, tileY) => promises.push(fetchRasterTile(tileX, tileY)))
  return Promise.all(promises)
}
