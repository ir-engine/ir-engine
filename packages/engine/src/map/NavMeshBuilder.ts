import * as YUKA from 'yuka'
import { Geometry, Position } from 'geojson'
import earcut from 'earcut'

export class NavMeshBuilder {
  polygons: YUKA.Polygon[] = []

  constructor() {}

  _toYukaPolygons(geometry: Geometry, elevation: number): YUKA.Polygon[] {
    switch (geometry.type) {
      case 'Polygon':
        return this._coordsToYukaPolygons(geometry.coordinates, elevation)
      case 'MultiPolygon':
        return geometry.coordinates.reduce(
          (acc, polygonCoords) => acc.concat(this._coordsToYukaPolygons(polygonCoords, elevation)),
          new Array<YUKA.Polygon>()
        )
    }
  }

  /**
   * takes a ring from a geojson polygon and applies some transformation(s) needed to create
   * the functionally equivalent polygon in a Yuka NavMesh.
   */
  _toYukaRing(ring: Position[]) {
    return ring.map((position) => [position[0], -position[1]])
  }

  _coordsToYukaPolygons(coords: Position[][], elevation: number): YUKA.Polygon[] {
    /** array of non-overlapping polygons */
    const exteriorRings: Position[][] = coords.length > 1 ? this._tessellate(coords) : coords
    return exteriorRings.map((ring) => {
      const result = new YUKA.Polygon()
      const vec3s = this._toYukaVectors3(this._toYukaRing(ring), elevation)

      result.fromContour(vec3s)

      return result
    })
  }

  _indexedVerticesToGeoJSONTriangles(indexes: number[], vertices: number[]): Position[][] {
    const count = indexes.length

    const trianglesFlat: Position[] = []
    const triangles: Position[][] = []

    for (let i = 0; i < count; i++) {
      var index = indexes[i]
      trianglesFlat.push([vertices[index * 2], vertices[index * 2 + 1]])
    }

    for (let i = 0; i < count; i += 3) {
      triangles.push(trianglesFlat.slice(i, i + 3))
    }
    return triangles
  }

  _tessellate(coords: Position[][]): Position[][] {
    const { vertices, holes } = earcut.flatten(coords)
    const indexes = earcut(vertices, holes, 2)
    return this._indexedVerticesToGeoJSONTriangles(indexes, vertices)
  }

  _toYukaVectors3(coords: Position[], elevation: number) {
    return coords.map((coord) => {
      return new YUKA.Vector3(coord[0], elevation, coord[1])
    })
  }

  addGeometry(geometry: Geometry, elevation = 0): NavMeshBuilder {
    this.polygons = this.polygons.concat(this._toYukaPolygons(geometry, elevation))
    return this
  }

  build(): YUKA.NavMesh {
    const result = new YUKA.NavMesh()
    result.fromPolygons(this.polygons)
    return result
  }
}
