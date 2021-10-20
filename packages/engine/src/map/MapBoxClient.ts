import { Position } from 'geojson'

// TODO try higher zoom levels
export const NUMBER_OF_TILES_PER_DIMENSION = 3
const WHOLE_NUMBER_OF_TILES_FROM_CENTER = Math.floor(NUMBER_OF_TILES_PER_DIMENSION / 2)
const NUMBER_OF_TILES_IS_ODD = NUMBER_OF_TILES_PER_DIMENSION % 2

export const RASTER_TILE_SIZE_HDPI = 256

async function fetchRasterTile(tileX: number, tileY: number): Promise<ImageBitmap> {
  const url = getMapBoxUrl('mapbox.satellite', tileX, tileY, 'png')

  const response = await fetch(url)
  const blob = await response.blob()
  return createImageBitmap(blob)
}

function forEachSurroundingTile(llPosition: Position, callback: (tileX: number, tileY: number) => void) {
  const tileX0 = longToTileX(llPosition[0], TILE_ZOOM)
  const tileY0 = latToTileY(llPosition[1], TILE_ZOOM)
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
 * @returns promise resolving to array of raster tiles
 */
export function fetchRasterTiles(llCenter: Position): Promise<ImageBitmap[]> {
  const promises: Promise<ImageBitmap>[] = []
  forEachSurroundingTile(llCenter, (tileX, tileY) => promises.push(fetchRasterTile(tileX, tileY)))
  return Promise.all(promises)
}
