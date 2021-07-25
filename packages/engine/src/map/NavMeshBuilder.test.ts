import { Geometry } from 'geojson'
import * as YUKA from 'yuka'
import { NavMeshBuilder } from './NavMeshBuilder'

function mockCallArg(fn: Function, callIdx: number, argIdx: number): any {
  return (fn as jest.Mock).mock.calls[callIdx][argIdx]
}

const boxCoords = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1]
]
const polygon: Geometry = {
  type: 'Polygon',
  coordinates: [boxCoords]
}
const multiPolygon: Geometry = {
  type: 'MultiPolygon',
  coordinates: [[boxCoords], [boxCoords.map(([x, z]) => [x + 5, z + 5])]]
}

describe('NavMeshBuilder', () => {
  it('handles GeoJSON Polygons', () => {
    jest.spyOn(YUKA.NavMesh.prototype, 'fromPolygons')
    const sut = new NavMeshBuilder()
    ;[polygon, multiPolygon].forEach((geometry) => sut.addGeometry(geometry))
    expect(sut.build()).toBeInstanceOf(YUKA.NavMesh)
    expect(mockCallArg(YUKA.NavMesh.prototype.fromPolygons, 0, 0)).toEqual(sut.polygons)
  })

  /** it's important to use a non-arrow function for this mock
   * so that the `this` parameter is the Polygon instance
   */
  function fromContourMock(vec3s: YUKA.Vector3[]) {
    ;(this as any).vec3s = vec3s
    return this
  }

  test('_toYukaPolygons', () => {
    jest.spyOn(YUKA.Polygon.prototype, 'fromContour').mockImplementation(fromContourMock)
    const sut = new NavMeshBuilder()

    let result = sut._toYukaPolygons(polygon, 0)
    expect((result[0] as any).vec3s).toEqual(sut._toYukaVectors3(polygon.coordinates[0], 0))

    result = sut._toYukaPolygons(multiPolygon, 0)
    expect((result[0] as any).vec3s).toEqual(sut._toYukaVectors3(multiPolygon.coordinates[0][0], 0))
    expect((result[1] as any).vec3s).toEqual(sut._toYukaVectors3(multiPolygon.coordinates[1][0], 0))
  })

  test('_toYukaVectors3', () => {
    const sut = new NavMeshBuilder()

    expect(sut._toYukaVectors3([[140, 36]], 0)).toEqual([new YUKA.Vector3(140, 0, 36)])
  })
})
