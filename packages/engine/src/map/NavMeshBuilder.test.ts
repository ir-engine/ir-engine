import assert from 'assert'
import sinon, {SinonSpy} from 'sinon'
import { Geometry, Position } from 'geojson'
import * as YUKA from 'yuka'
import { NavMeshBuilder } from '../../src/map/NavMeshBuilder'

function mockCallArg(fn: Function, callIdx: number, argIdx: number): any {
  return (fn as SinonSpy).getCall(callIdx).args[argIdx]
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
const polygon: Geometry = {
  type: 'Polygon',
  coordinates: [boxCoords]
}
const multiPolygon: Geometry = {
  type: 'MultiPolygon',
  coordinates: [[boxCoords], [translatePolygon(boxCoords, 5, 5)]]
}

describe('NavMeshBuilder', () => {
  it('handles GeoJSON Polygons', () => {
    const spy = sinon.spy(YUKA.NavMesh.prototype, "fromPolygons")
    const sut = new NavMeshBuilder()
    ;[polygon, multiPolygon].forEach((geometry) => sut.addGeometry(geometry))
    assert(sut.build() instanceof YUKA.NavMesh)
    assert.deepEqual(mockCallArg(spy, 0, 0), sut.polygons)
    spy.restore()
  })

  /** it's important to use a non-arrow functions for method mocks
   * so that the `this` parameter is the Polygon instance
   */
  function fromContourFake(vec3s: YUKA.Vector3[]) {
    ;(this as any).vec3s = vec3s
    return this
  }

  it('converts geojson polygons to YUKA Polygons', () => {
    sinon.stub(YUKA.Polygon.prototype, "fromContour").callsFake(fromContourFake)
    const sut = new NavMeshBuilder()

    let result = sut._toYukaPolygons(polygon, 0)
    assert.deepEqual((result[0] as any).vec3s, sut._toYukaVectors3(polygon.coordinates[0], 0))

    result = sut._toYukaPolygons(multiPolygon, 0)
    assert.deepEqual((result[0] as any).vec3s, sut._toYukaVectors3(multiPolygon.coordinates[0][0], 0))
    assert.deepEqual((result[1] as any).vec3s, sut._toYukaVectors3(multiPolygon.coordinates[1][0], 0))
  })

  it('converts numeric tuples to YUKA Vectors', () => {
    const sut = new NavMeshBuilder()

    assert.deepEqual(sut._toYukaVectors3([[140, 36]], 0), [new YUKA.Vector3(140, 0, 36)])
  })

  afterEach(() => {
    sinon.restore()
  })
})
