/**
 * @author mohrtw / https://github.com/mohrtw
 */

import {
  Geometry,
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2
} from 'three'

// RoundedCornersPlaneGeometry

function RoundedCornersPlaneGeometry (width: number, height: number, radius?: number,
  segments?: number, thetaStart?: number, thetaLength?: number): void {
  Geometry.call(this)

  this.type = 'RoundedCornersPlaneGeometry'

  this.parameters = {
    width: width,
    height: height,
    radius: radius || 1,
    segments: segments || 8,
    thetaStart: thetaStart || 0,
    thetaLength: thetaLength || 2 * Math.PI
  }

  this.fromBufferGeometry(new RoundedCornersPlaneBufferGeometry(width, height, radius, segments, thetaStart, thetaLength))
  this.mergeVertices()
}

RoundedCornersPlaneGeometry.prototype = Object.create(Geometry.prototype)
RoundedCornersPlaneGeometry.prototype.constructor = RoundedCornersPlaneGeometry

// RoundedCornersPlaneBufferGeometry

function RoundedCornersPlaneBufferGeometry (width: number, height: number, radius?: number,
  segments?: number, thetaStart?: number, thetaLength?: number): void {
  BufferGeometry.call(this)

  this.type = 'RoundedCornersPlaneBufferGeometry'

  this.parameters = {
    radius: radius,
    width: width,
    height: height,
    segments: segments,
    thetaStart: thetaStart,
    thetaLength: thetaLength
  }

  radius = radius || 1
  segments = segments !== undefined ? Math.max(3, segments) : 8

  thetaStart = thetaStart !== undefined ? thetaStart : 0
  thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2

  // buffers
  const indices = []
  const vertices = []
  const normals = []
  const uvs = []

  // helper variables
  const vertex = new Vector3()
  const uv = new Vector2()

  // center point
  vertices.push(0, 0, 0)
  normals.push(0, 0, 1)
  uvs.push(0.5, 0.5)

  function cornerPoint (phi: number): { x: number, y: number } {
    const origin = { x: 0, y: 0 }
    const theta = phi % (2 * Math.PI)
    if (theta < Math.PI / 2 || theta > Math.PI * 3 / 2) {
      origin.x = width / 2 - radius
    } else { origin.x = -width / 2 + radius }

    if (theta < Math.PI) {
      origin.y = height / 2 - radius
    } else { origin.y = -height / 2 + radius }

    const x = origin.x + radius * Math.cos(phi)
    const y = origin.y + radius * Math.sin(phi)
    return { x: x, y: y }
  }

  for (let s = 0, i = 3; s <= segments * 4; s++, i += 3) {
    const phi: number = (s / (segments * 4)) * (Math.PI * 2)

    const point = cornerPoint(phi)
    vertex.x = point.x
    vertex.y = point.y
    vertices.push(vertex.x, vertex.y, vertex.z)

    // normal
    normals.push(0, 0, 1)

    // uvs
    uv.x = vertices[i]
    uv.y = vertices[i + 1]
    uvs.push(uv.x, uv.y)
  }

  // indices
  for (let i = 1; i <= segments * 4; i++) {
    indices.push(i, i + 1, 0)
  }

  // build geometry

  this.setIndex(indices)
  this.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  this.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  this.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
}

RoundedCornersPlaneBufferGeometry.prototype = Object.create(BufferGeometry.prototype)
RoundedCornersPlaneBufferGeometry.prototype.constructor = RoundedCornersPlaneBufferGeometry

export { RoundedCornersPlaneGeometry, RoundedCornersPlaneBufferGeometry }
