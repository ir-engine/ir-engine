import {ILayerName, TileFeaturesByLayer} from './types'
import { VectorTile } from '@mapbox/vector-tile'
import { Feature, Position } from 'geojson'
import { Config } from '@xrengine/client-core/src/helper'

const TILE_ZOOM = 16
const LAYERS: ILayerName[] = ['building', 'road']
export const NUMBER_OF_TILES_PER_DIMENSION = 3
const WHOLE_NUMBER_OF_TILES_FROM_CENTER = Math.floor(NUMBER_OF_TILES_PER_DIMENSION / 2)
const NUMBER_OF_TILES_IS_ODD = NUMBER_OF_TILES_PER_DIMENSION % 2

import { vectors } from './vectors'
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

function getMapBoxUrl(layerId: string, tileX: number, tileY: number, format: string) {
  return `https://api.mapbox.com/v4/${layerId}/${TILE_ZOOM}/${tileX}/${tileY}.${format}?access_token=${Config.publicRuntimeConfig.MAPBOX_API_KEY}`
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

/**
 * @returns promise resolving to array containing one array of features per tile
 */
function fetchSurroundingTiles(llCenter: Position): Promise<TileFeaturesByLayer[]> {
  const promises = []
  forEachSurroundingTile(llCenter, (tileX, tileY) => promises.push(fetchTileFeatures(tileX, tileY)))
  return Promise.all(promises)
}

export function fetchTiles(llCenter: Position): Promise<TileFeaturesByLayer[]> {
  return fetchSurroundingTiles(llCenter)
}
