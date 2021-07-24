import * as YUKA from 'yuka'
import { Geometry, Position } from 'geojson'

export class NavMeshBuilder {
  polygons: YUKA.Polygon[] = []

  constructor() {}

  buildFromGeometries(geometriesIn: Geometry[], elevation = 0): YUKA.NavMesh {
    geometriesIn.forEach((g) => this.addGeometry(g, elevation))

    return this.build()
  }

  _toYukaPolygons(geometry: Geometry, elevation: number): YUKA.Polygon[] {
    switch (geometry.type) {
      case 'Polygon':
        return [this._coordsToYukaPolygon(geometry.coordinates, elevation)]
      case 'MultiPolygon':
        return geometry.coordinates.map((polygonCoords) => this._coordsToYukaPolygon(polygonCoords, elevation))
    }
  }

  _coordsToYukaPolygon(coords: Position[][], elevation: number): YUKA.Polygon {
    const result = new YUKA.Polygon()
    const vec3s = this._toYukaVectors3(coords[0], elevation)
    result.fromContour(vec3s)
    return result
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
