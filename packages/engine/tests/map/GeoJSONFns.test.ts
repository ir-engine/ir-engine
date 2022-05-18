import assert from 'assert'
import {
  computeBoundingBox,
  computeBoundingCircleRadius,
  scalePolygon
} from '../../src/map/GeoJSONFns'
import { Geometry, Polygon } from 'geojson'
import { feature, geometry } from '@turf/turf'
const boxCoords = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
]
const polygonSmall: Geometry = {
  type: 'Polygon',
  coordinates: [boxCoords]
}
const polygonBig: Geometry = {
  type: 'Polygon',
  coordinates: [scalePolygon(boxCoords, 5, 5)]
}

describe('computeBoundingBox', () => {
  it('computes the bounding box (2D) of a set of polygons', () => {
    const polygons: Polygon[] = polygonBig.coordinates[0].map((offsetCoords) => ({
      type: 'Polygon',
      coordinates: [
        polygonSmall.coordinates[0].map((boxCoords) => {
          return [boxCoords[0] + offsetCoords[0], boxCoords[1] + offsetCoords[1]]
        })
      ]
    }))

    assert.deepEqual(computeBoundingBox(polygons), {
      type: 'Polygon',
      coordinates: [
        [
          [-6, -6],
          [6, -6],
          [6, 6],
          [-6, 6],
          [-6, -6]
        ]
      ]
    })
  })
})

describe('computeBoundingCircleRadius', () => {
  it('works', () => {
    const wideBox = feature(geometry('Polygon', [scalePolygon(boxCoords, 6, 1)]))
    const longBox = feature(geometry('Polygon', [scalePolygon(boxCoords, 1, 8)]))

    assert(computeBoundingCircleRadius(wideBox) === 6)
    assert(computeBoundingCircleRadius(longBox) === 8)
  })
})
