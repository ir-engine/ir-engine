import { Polygon } from 'polygon-clipping'
import {
  Float32BufferAttribute,
  Color,
  BufferGeometry,
  MeshBasicMaterial,
  Mesh,
  Shape,
  ShapeBufferGeometry,
  Path
} from 'three'

export function createPolygonHelper(polygon: Polygon): Mesh {
  const shape = new Shape()

  const color = new Color()
  color.setHex(Math.random() * 0xffffff)
  const outerRing = polygon[0]
  let point = outerRing[0]
  shape.moveTo(point[0], point[1])

  // TODO(DRY) make a function that converts a GeoJSON Polygon to a THREE Shape
  outerRing.slice(1).forEach((point) => {
    shape.lineTo(point[0], point[1])
  })

  for (let innerRingIndex = 1, l = polygon.length; innerRingIndex < l; innerRingIndex++) {
    const ring = polygon[innerRingIndex]
    const path = new Path()
    path.moveTo(ring[0][0], ring[0][1])
    for (const pair of ring) {
      path.lineTo(pair[0], pair[1])
    }
    shape.holes[innerRingIndex - 1] = path
  }

  const geometry = new ShapeBufferGeometry(shape)
  const material = new MeshBasicMaterial({ color })

  geometry.rotateX(-Math.PI / 2)
  return new Mesh(geometry, material)
}

/** All angles must be >= 180 degrees. Holes / interior rings are ignored.
 */
export function createConvexMultiPolygonHelper(polygons: Polygon[]): Mesh {
  const geometry = new BufferGeometry()
  const material = new MeshBasicMaterial({ vertexColors: true })

  const mesh = new Mesh(geometry, material)

  const positions = [] as number[]
  const colors = [] as number[]

  const color = new Color()

  for (const polygon of polygons) {
    // one color for each polygon
    color.setHex(Math.random() * 0xffffff)

    const outerRing = polygon[0]

    const triangleCount = outerRing.length - 1

    // This only works on convex polygons
    for (let pairIndex = 0; pairIndex < triangleCount; pairIndex++) {
      const [x0, z0] = outerRing[0]
      const [x1, z1] = outerRing[pairIndex]
      const [x2, z2] = outerRing[pairIndex + 1]
      positions.push(x0, 0, -z0)
      positions.push(x1, 0, -z1)
      positions.push(x2, 0, -z2)

      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
    }
  }

  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

  return mesh
}
