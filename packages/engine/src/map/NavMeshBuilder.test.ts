import {Geometry} from "geojson";
import * as YUKA from "yuka"
import {NavMeshBuilder} from "./NavMeshBuilder"

function mockCallArg(fn: Function, callIdx: number, argIdx: number): any {
  return (fn as jest.Mock).mock.calls[callIdx][argIdx]
}

describe("NavMeshBuilder", () => {
  it("handles GeoJSON Polygons", () => {
    jest.spyOn(YUKA.NavMesh.prototype, "fromPolygons")
    const sut = new NavMeshBuilder()
    const coords = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ]

    const polygon: Geometry = {
      type: "Polygon",
      coordinates: [coords]
    }
    expect(sut.buildFromGeometries([polygon])).toBeInstanceOf(YUKA.NavMesh)
    expect(mockCallArg(YUKA.NavMesh.prototype.fromPolygons, 0, 0)).toEqual(sut.polygons)
  })

  test("_toYukaPolygon", () => {
    jest.spyOn(YUKA.Polygon.prototype, "fromContour")
    const sut = new NavMeshBuilder()
    const coords = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ]

    const polygon: Geometry = {
      type: "Polygon",
      coordinates: [coords]
    }
    sut._toYukaPolygon(polygon, 0)
    expect(mockCallArg(YUKA.Polygon.prototype.fromContour, 0, 0).map((v: YUKA.Vector3) => [v.x, v.z])).toEqual(coords)
  })
})
