import { Polygon, MultiPolygon, Position, Feature } from 'geojson'
import rewind from '@mapbox/geojson-rewind'
import { groupBy } from 'lodash'
import polygonClipping from 'polygon-clipping'
import { multiPolygon, polygon } from '@turf/turf'

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

/** Useful for when a feature is split across multiple vector tiles */
export function unifyFeatures(features: Feature[]): Feature[] {
  const featuresById = groupBy(features, 'id')

  const featuresByIdArray = Object.values(featuresById)

  return featuresByIdArray.map((features) => {
    if (features.length > 1) {
      const allCoords = features.map(getCoords)

      const unifiedCoords = polygonClipping.union.apply(null, allCoords)
      let maxHeight = 0

      features.forEach((f) => {
        maxHeight = f.properties.height ? Math.max(f.properties.height) : maxHeight
      })
      const unifiedProperties = {
        ...features[0].properties,
        height: maxHeight
      }

      return unifiedCoords.length === 1
        ? polygon(unifiedCoords[0] as any, unifiedProperties)
        : multiPolygon(unifiedCoords as any, unifiedProperties)
    } else {
      return features[0]
    }
  })

  function getCoords(f: Feature): polygonClipping.Polygon | polygonClipping.MultiPolygon {
    return (f.geometry as Polygon).coordinates as any
  }
}
