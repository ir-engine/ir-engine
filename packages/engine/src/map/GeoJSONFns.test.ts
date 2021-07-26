import { subtract } from './GeoJSONFns'
import { Geometry, Position } from 'geojson'
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
const polygonSmall: Geometry = {
  type: 'Polygon',
  coordinates: [boxCoords]
}
const polygonBig: Geometry = {
  type: 'Polygon',
  coordinates: [scalePolygon(boxCoords, 5, 5)]
}
describe('GeoJSONFns', () => {
  it('subtracts a small polygon from a big one', () => {
    const result = subtract(polygonBig, [polygonSmall])

    expect(result.coordinates[0]).toEqual(polygonBig.coordinates[0])
    expect(result.coordinates[1]).toEqual(polygonSmall.coordinates[0].reverse())
  })
})
