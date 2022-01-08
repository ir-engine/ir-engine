// stringified worker code relies on "turf" module being globally available
//
// TODO delete unused functions, reorganize in to files in functions/
import * as turf from '@turf/turf'
import { Feature, MultiPolygon, Polygon, Position } from 'geojson'

export function scalePolygon(coords: Position[], xFactor: number, zFactor: number): Position[] {
  return coords.map(([x, z]) => [x * xFactor, z * zFactor])
}
export function translatePolygon(coords: Position[], xDiff: number, zDiff: number): Position[] {
  return coords.map(([x, z]) => [x + xDiff, z + zDiff])
}

function subtractPolygonCoordinates(self: Polygon, other: Position[][]) {
  self.coordinates.push(other[0])
}

export function computeBoundingBox(set: (Polygon | MultiPolygon)[]): Polygon {
  let minX = 0
  let minY = 0
  let maxX = 0
  let maxY = 0

  set.forEach((item) => {
    switch (item.type) {
      case 'Polygon':
        item.coordinates[0].forEach((coord) => {
          minX = Math.min(minX, coord[0])
          minY = Math.min(minY, coord[1])
          maxX = Math.max(maxX, coord[0])
          maxY = Math.max(maxY, coord[1])
        })
        break
      case 'MultiPolygon':
        item.coordinates.forEach((polygonCoords) => {
          polygonCoords[0].forEach((coord) => {
            minX = Math.min(minX, coord[0])
            minY = Math.min(minY, coord[1])
            maxX = Math.max(maxX, coord[0])
            maxY = Math.max(maxY, coord[1])
          })
        })
        break
    }
  })

  return {
    type: 'Polygon',
    coordinates: [
      [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY]
      ]
    ]
  }
}

export function copy(self: Polygon): Polygon {
  return {
    type: 'Polygon',
    coordinates: self.coordinates.slice()
  }
}

export function addTileIndex(featuresFromTile: Feature[]) {
  featuresFromTile.forEach((feature, index) => {
    const properties = (feature.properties ||= {})
    properties['tileIndex'] = `${index}`
  })
}

export function scaleAndTranslatePosition(position: Position, llCenter: Position, scale = 1) {
  return [(position[0] - llCenter[0]) * scale, (position[1] - llCenter[1]) * scale]
}

export function scaleAndTranslatePolygon(coords: Position[][], llCenter: Position, scale = 1) {
  return [coords[0].map((position) => scaleAndTranslatePosition(position, llCenter, scale))]
}

export function scaleAndTranslate(geometry: Polygon | MultiPolygon, llCenter: Position, scale = 1) {
  switch (geometry.type) {
    case 'MultiPolygon':
      geometry.coordinates = geometry.coordinates.map((coords) => scaleAndTranslatePolygon(coords, llCenter, scale))
      break
    case 'Polygon':
      geometry.coordinates = scaleAndTranslatePolygon(geometry.coordinates, llCenter, scale)
      break
  }

  return geometry
}

export function computeBoundingCircleRadius(feature: Feature) {
  const [minX, minY, maxX, maxY] = turf.bbox(feature)

  return Math.max(maxX - minX, maxY - minY) / 2
}
