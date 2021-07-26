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

export function copy(self: Polygon): Polygon {
  return {
    type: 'Polygon',
    coordinates: self.coordinates.slice()
  }
}
