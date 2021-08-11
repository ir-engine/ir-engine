import { Geometry, Position } from 'geojson'
import * as YUKA from 'yuka'
import { NavMeshBuilder } from './NavMeshBuilder'

function mockCallArg(fn: Function, callIdx: number, argIdx: number): any {
  return (fn as jest.Mock).mock.calls[callIdx][argIdx]
}

const boxCoords = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
]
function translatePolygon(coords: Position[], xDiff: number, zDiff: number): Position[] {
  return coords.map(([x, z]) => [x + xDiff, z + zDiff])
}
function scalePolygon(coords: Position[], xFactor: number, zFactor: number): Position[] {
  return coords.map(([x, z]) => [x * xFactor, z * zFactor])
}
const polygon: Geometry = {
  type: 'Polygon',
  coordinates: [boxCoords]
}
const multiPolygon: Geometry = {
  type: 'MultiPolygon',
  coordinates: [[boxCoords], [translatePolygon(boxCoords, 5, 5)]]
}

const polygonInteriorRing: Geometry = {
  type: 'Polygon',
  coordinates: [scalePolygon(boxCoords, 5, 5), boxCoords.reverse()]
}

describe('NavMeshBuilder', () => {
  it('handles GeoJSON Polygons', () => {
    jest.spyOn(YUKA.NavMesh.prototype, 'fromPolygons')
    const sut = new NavMeshBuilder()
    ;[polygon, multiPolygon, polygonInteriorRing].forEach((geometry) => sut.addGeometry(geometry))
    expect(sut.build()).toBeInstanceOf(YUKA.NavMesh)
    expect(mockCallArg(YUKA.NavMesh.prototype.fromPolygons, 0, 0)).toEqual(sut.polygons)
  })

  /** it's important to use a non-arrow functions for method mocks
   * so that the `this` parameter is the Polygon instance
   */
  function fromContourMock(vec3s: YUKA.Vector3[]) {
    ;(this as any).vec3s = vec3s
    return this
  }

  test('_toYukaCoords', () => {
    const sut = new NavMeshBuilder()
    const result = sut._toYukaRing([
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1]
    ])

    expect(result).toEqual([
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1]
    ])
  })

  test('_toYukaPolygons', () => {
    jest.spyOn(YUKA.Polygon.prototype, 'fromContour').mockImplementation(fromContourMock)
    const sut = new NavMeshBuilder()

    let result = sut._toYukaPolygons(polygon, 0)
    expect((result[0] as any).vec3s).toEqual(sut._toYukaVectors3(sut._toYukaRing(polygon.coordinates[0]), 0))

    result = sut._toYukaPolygons(multiPolygon, 0)
    expect((result[0] as any).vec3s).toEqual(sut._toYukaVectors3(sut._toYukaRing(multiPolygon.coordinates[0][0]), 0))
    expect((result[1] as any).vec3s).toEqual(sut._toYukaVectors3(sut._toYukaRing(multiPolygon.coordinates[1][0]), 0))

    result = sut._toYukaPolygons(polygonInteriorRing, 0)
    expect(result.length).toEqual(8)
  })

  test('_toYukaVectors3', () => {
    const sut = new NavMeshBuilder()

    expect(sut._toYukaVectors3([[140, 36]], 0)).toEqual([new YUKA.Vector3(140, 0, 36)])
  })

  test('_indexedVerticesToGeoJSONTriangles', () => {
    const sut = new NavMeshBuilder()
    expect(sut._indexedVerticesToGeoJSONTriangles([2, 1, 0, 5, 3, 4], [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6])).toEqual([
      [
        [3, 3],
        [2, 2],
        [1, 1]
      ],
      [
        [6, 6],
        [4, 4],
        [5, 5]
      ]
    ])
  })
})
