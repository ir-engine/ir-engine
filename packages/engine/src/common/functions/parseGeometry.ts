import { Polygon, Vector3 } from 'yuka'

function parseGeometry(data: { index: number[]; position: number[] }): Polygon[] {
  const index = data.index
  const position = data.position
  console.log('parseGeometry.position.length', position.length)
  console.log('parseGeometry.index.length', index.length)

  const vertices: Vector3[] = []
  const polygons: Polygon[] = []

  // vertices

  for (let i = 0, l = position.length; i < l; i += 3) {
    const v = new Vector3()

    v.x = position[i + 0]
    v.y = position[i + 1]
    v.z = position[i + 2]

    vertices.push(v)
  }

  // polygons

  if (index) {
    // indexed geometry

    for (let i = 0, l = index.length; i < l; i += 3) {
      const a = index[i + 0]
      const b = index[i + 1]
      const c = index[i + 2]

      const contour = [vertices[a], vertices[b], vertices[c]]

      const polygon = new Polygon().fromContour(contour)

      polygons.push(polygon)
    }
  } else {
    // non-indexed geometry //todo test

    for (let i = 0, l = vertices.length; i < l; i += 3) {
      const contour = [vertices[i + 0], vertices[i + 1], vertices[i + 2]]

      const polygon = new Polygon().fromContour(contour)

      polygons.push(polygon)
    }
  }

  return polygons
}

export { parseGeometry }
