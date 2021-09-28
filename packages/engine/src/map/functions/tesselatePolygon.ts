import earcut from 'earcut'
import { Polygon, Ring } from 'polygon-clipping'

export function indexedVerticesToGeoJSONTriangles(indexes: number[], vertices: number[]): Polygon[] {
  const count = indexes.length

  const trianglesFlat: Ring = []
  const triangles: Polygon[] = []

  for (let i = 0; i < count; i++) {
    var index = indexes[i]
    trianglesFlat.push([vertices[index * 2], vertices[index * 2 + 1]])
  }

  for (let i = 0; i < count; i += 3) {
    triangles.push([trianglesFlat.slice(i, i + 3)])
  }
  return triangles
}

export default function tesselatePolygon(polygon: Polygon) {
  const { vertices, holes } = earcut.flatten(polygon)
  const indexes = earcut(vertices, holes, 2)
  return indexedVerticesToGeoJSONTriangles(indexes, vertices)
}
