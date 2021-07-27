import { Polygon, MultiPolygon, Position } from 'geojson'
import rewind from '@mapbox/geojson-rewind'

/**
 * Assumptions:
 *   - self completely surrounds all of the other polygons
 *   - self does not contain holes/interior rings
 *   - self is a simple polygon without overlapping edges
 *   - other polygons do not have holes, or not ones we care about
 */
export function subtract(self: Polygon, others: (Polygon | MultiPolygon)[]): Polygon {
  others.forEach((other) => {
    switch (other.type) {
      case 'Polygon':
        subtractPolygonCoordinates(self, other.coordinates)
      case 'MultiPolygon':
        other.coordinates.forEach((polygonCoords) => {
          subtractPolygonCoordinates(self, polygonCoords)
        })
    }
  })
  return rewind(self)
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
