import { Geometry, Position } from 'geojson'
import * as YUKA from 'yuka'

// TODO move to classes/NavMeshBuilder.ts

export class NavMeshBuilder {
  polygons: YUKA.Polygon[] = []

  constructor() {}

  _toYukaPolygons(geometry: Geometry, elevation: number): YUKA.Polygon[] {
    switch (geometry.type) {
      case 'Polygon':
        return this._coordsToYukaPolygon(geometry.coordinates, elevation)
      case 'MultiPolygon':
        return geometry.coordinates.reduce(
          (acc, polygonCoords) => acc.concat(this._coordsToYukaPolygon(polygonCoords, elevation)),
          new Array<YUKA.Polygon>()
        )
    }
    return null!
  }

  /** @param polygon a GeoJSON polygon with no holes */
  _coordsToYukaPolygon(polygon: Position[][], elevation: number): YUKA.Polygon[] {
    const ring = polygon[0]
    const result = new YUKA.Polygon()
    const vec3s = this._toYukaVectors3(ring, elevation)

    result.fromContour(vec3s)

    return [result]
  }

  _toYukaVectors3(coords: Position[], elevation: number) {
    return coords.map((coord) => {
      return new YUKA.Vector3(coord[0], elevation, coord[1])
    })
  }

  /** @param geometry a GeoJSON polygon or multipolygon without any holes */
  addGeometry(geometry: Geometry, elevation = 0): NavMeshBuilder {
    this.polygons = this.polygons.concat(this._toYukaPolygons(geometry, elevation))
    return this
  }

  build(target = new YUKA.NavMesh()): YUKA.NavMesh {
    target.fromPolygons(this.polygons)
    return target
  }

  reset() {
    this.polygons = []
  }
}
