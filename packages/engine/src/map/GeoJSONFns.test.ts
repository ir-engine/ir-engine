import { subtract, copy, computeBoundingBox } from './GeoJSONFns'
import { Geometry, Polygon, Position } from 'geojson'
const boxCoords = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
]
function scalePolygon(coords: Position[], xFactor: number, zFactor: number): Position[] {
  return coords.map(([x, z]) => [x * xFactor, z * zFactor])
}
function translatePolygon(coords: Position[], xDiff: number, zDiff: number): Position[] {
  return coords.map(([x, z]) => [x + xDiff, z + zDiff])
}
const polygonSmall: Geometry = {
  type: 'Polygon',
  coordinates: [boxCoords]
}
const multiPolygonSmall: Geometry = {
  type: 'MultiPolygon',
  coordinates: [[boxCoords], [translatePolygon(boxCoords, 2, 2)]]
}
const polygonBig: Geometry = {
  type: 'Polygon',
  coordinates: [scalePolygon(boxCoords, 5, 5)]
}
describe('GeoJSONFns', () => {
  it('subtracts a small polygon from a big one', () => {
    const result = subtract(copy(polygonBig), [polygonSmall])

    expect(result.coordinates[0]).toEqual(polygonBig.coordinates[0])
    expect(result.coordinates[1]).toEqual(polygonSmall.coordinates[0].reverse())
  })
  it('subtracts a small multi-polygon from a big one', () => {
    const result = subtract(copy(polygonBig), [multiPolygonSmall])

    expect(result.coordinates[0]).toEqual(polygonBig.coordinates[0])
    expect(result.coordinates[1]).toEqual(multiPolygonSmall.coordinates[0][0].reverse())
    expect(result.coordinates[2]).toEqual(multiPolygonSmall.coordinates[1][0].reverse())
  })

  it('computes the bounding box (2D) of a set of polygons', () => {
    const polygons: Polygon[] = polygonBig.coordinates[0].map((offsetCoords) => ({
      type: 'Polygon',
      coordinates: [
        polygonSmall.coordinates[0].map((boxCoords) => {
          return [boxCoords[0] + offsetCoords[0], boxCoords[1] + offsetCoords[1]]
        })
      ]
    }))

    expect(computeBoundingBox(polygons)).toEqual({
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
