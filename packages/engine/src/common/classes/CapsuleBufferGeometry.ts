// Credit https://github.com/maximeq/three-js-capsule-geometry

import { BufferGeometry, BufferAttribute, Vector3, Vector2 } from 'three'

// helper letiables

/**
 * @author maximequiblier
 */
export class CapsuleBufferGeometry extends BufferGeometry {
  parameters
  radiusTop: number
  radiusBottom: number
  height: number
  radialSegments: number
  heightSegments: number
  capsTopSegments: number
  capsBottomSegments: number
  thetaStart: number
  thetaLength: number
  alpha: number
  eqRadii: boolean
  vertexCount: number
  indexCount: number
  indices: BufferAttribute
  vertices: BufferAttribute
  normals: BufferAttribute
  uvs: BufferAttribute
  _index = 0
  _halfHeight = 0
  _indexArray: number[][] = []
  _indexOffset = 0

  constructor(
    radiusTop?: number,
    radiusBottom?: number,
    height?: number,
    radialSegments?: number,
    heightSegments?: number,
    capsTopSegments?: number,
    capsBottomSegments?: number,
    thetaStart?: number,
    thetaLength?: number
  ) {
    super()
    this.type = 'CapsuleBufferGeometry'

    this.parameters = {
      radiusTop: radiusTop,
      radiusBottom: radiusBottom,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    }

    this.radiusTop = radiusTop !== undefined ? radiusTop : 0.25
    this.radiusBottom = radiusBottom !== undefined ? radiusBottom : 0.25
    this.height = height !== undefined ? height : 1

    this.radialSegments = Math.floor(radialSegments ?? 8)
    this.heightSegments = Math.floor(heightSegments ?? 1)
    this.capsTopSegments = Math.floor(capsTopSegments ?? 2)
    this.capsBottomSegments = Math.floor(capsBottomSegments ?? 2)

    this.thetaStart = thetaStart !== undefined ? thetaStart : 0.0
    this.thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI

    // Alpha is the angle such that Math.PI/2 - alpha is the cone part angle.
    this.alpha = Math.acos((this.radiusBottom - this.radiusTop) / this.height)
    this.eqRadii = this.radiusTop - this.radiusBottom === 0

    this.vertexCount = this.calculateVertexCount()
    this.indexCount = this.calculateIndexCount()

    // buffers
    this.indices = new BufferAttribute(new (this.indexCount > 65535 ? Uint32Array : Uint16Array)(this.indexCount), 1)
    this.vertices = new BufferAttribute(new Float32Array(this.vertexCount * 3), 3)
    this.normals = new BufferAttribute(new Float32Array(this.vertexCount * 3), 3)
    this.uvs = new BufferAttribute(new Float32Array(this.vertexCount * 2), 2)

    this._halfHeight = this.height / 2

    // generate geometry

    this.generateTorso()

    // build geometry

    this.setIndex(this.indices)
    this.setAttribute('position', this.vertices)
    this.setAttribute('normal', this.normals)
    this.setAttribute('uv', this.uvs)
  }

  // helper functions

  calculateVertexCount() {
    const count = (this.radialSegments + 1) * (this.heightSegments + 1 + this.capsBottomSegments + this.capsTopSegments)
    return count
  }

  calculateIndexCount() {
    const count = this.radialSegments * (this.heightSegments + this.capsBottomSegments + this.capsTopSegments) * 2 * 3
    return count
  }

  generateTorso() {
    let x, y
    const normal = new Vector3()
    const vertex = new Vector3()

    const cosAlpha = Math.cos(this.alpha)
    const sinAlpha = Math.sin(this.alpha)

    const cone_length = new Vector2(this.radiusTop * sinAlpha, this._halfHeight + this.radiusTop * cosAlpha)
      .sub(new Vector2(this.radiusBottom * sinAlpha, -this._halfHeight + this.radiusBottom * cosAlpha))
      .length()

    // Total length for v texture coord
    const vl = this.radiusTop * this.alpha + cone_length + this.radiusBottom * (Math.PI / 2 - this.alpha)

    const groupCount = 0

    // generate vertices, normals and uvs

    let v = 0
    for (y = 0; y <= this.capsTopSegments; y++) {
      const indexRow: number[] = []

      const a = Math.PI / 2 - this.alpha * (y / this.capsTopSegments)

      v += (this.radiusTop * this.alpha) / this.capsTopSegments

      const cosA = Math.cos(a)
      const sinA = Math.sin(a)

      // calculate the radius of the current row
      const radius = cosA * this.radiusTop

      for (x = 0; x <= this.radialSegments; x++) {
        const u = x / this.radialSegments

        const theta = u * this.thetaLength + this.thetaStart

        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        // vertex
        vertex.x = radius * sinTheta
        vertex.y = this._halfHeight + sinA * this.radiusTop
        vertex.z = radius * cosTheta
        this.vertices.setXYZ(this._index, vertex.x, vertex.y, vertex.z)

        // normal
        normal.set(cosA * sinTheta, sinA, cosA * cosTheta)
        this.normals.setXYZ(this._index, normal.x, normal.y, normal.z)

        // uv
        this.uvs.setXY(this._index, u, 1 - v / vl)

        // save index of vertex in respective row
        indexRow.push(this._index)

        // increase index
        this._index++
      }

      // now save vertices of the row in our index array
      this._indexArray.push(indexRow)
    }

    const cone_height = this.height + cosAlpha * this.radiusTop - cosAlpha * this.radiusBottom
    const slope = (sinAlpha * (this.radiusBottom - this.radiusTop)) / cone_height
    for (y = 1; y <= this.heightSegments; y++) {
      const indexRow: number[] = []

      v += cone_length / this.heightSegments

      // calculate the radius of the current row
      const radius = sinAlpha * ((y * (this.radiusBottom - this.radiusTop)) / this.heightSegments + this.radiusTop)

      for (x = 0; x <= this.radialSegments; x++) {
        const u = x / this.radialSegments

        const theta = u * this.thetaLength + this.thetaStart

        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        // vertex
        vertex.x = radius * sinTheta
        vertex.y = this._halfHeight + cosAlpha * this.radiusTop - (y * cone_height) / this.heightSegments
        vertex.z = radius * cosTheta
        this.vertices.setXYZ(this._index, vertex.x, vertex.y, vertex.z)

        // normal
        normal.set(sinTheta, slope, cosTheta).normalize()
        this.normals.setXYZ(this._index, normal.x, normal.y, normal.z)

        // uv
        this.uvs.setXY(this._index, u, 1 - v / vl)

        // save index of vertex in respective row
        indexRow.push(this._index)

        // increase index
        this._index++
      }

      // now save vertices of the row in our index array
      this._indexArray.push(indexRow)
    }

    for (y = 1; y <= this.capsBottomSegments; y++) {
      const indexRow: number[] = []

      const a = Math.PI / 2 - this.alpha - (Math.PI - this.alpha) * (y / this.capsBottomSegments)

      v += (this.radiusBottom * this.alpha) / this.capsBottomSegments

      const cosA = Math.cos(a)
      const sinA = Math.sin(a)

      // calculate the radius of the current row
      const radius = cosA * this.radiusBottom

      for (x = 0; x <= this.radialSegments; x++) {
        const u = x / this.radialSegments

        const theta = u * this.thetaLength + this.thetaStart

        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        // vertex
        vertex.x = radius * sinTheta
        vertex.y = -this._halfHeight + sinA * this.radiusBottom
        vertex.z = radius * cosTheta
        this.vertices.setXYZ(this._index, vertex.x, vertex.y, vertex.z)

        // normal
        normal.set(cosA * sinTheta, sinA, cosA * cosTheta)
        this.normals.setXYZ(this._index, normal.x, normal.y, normal.z)

        // uv
        this.uvs.setXY(this._index, u, 1 - v / vl)

        // save index of vertex in respective row
        indexRow.push(this._index)

        // increase index
        this._index++
      }

      // now save vertices of the row in our index array
      this._indexArray.push(indexRow)
    }

    // generate indices

    for (x = 0; x < this.radialSegments; x++) {
      for (y = 0; y < this.capsTopSegments + this.heightSegments + this.capsBottomSegments; y++) {
        // we use the index array to access the correct indices
        const i1 = this._indexArray[y][x]
        const i2 = this._indexArray[y + 1][x]
        const i3 = this._indexArray[y + 1][x + 1]
        const i4 = this._indexArray[y][x + 1]

        // face one
        this.indices.setX(this._indexOffset, i1)
        this._indexOffset++
        this.indices.setX(this._indexOffset, i2)
        this._indexOffset++
        this.indices.setX(this._indexOffset, i4)
        this._indexOffset++

        // face two
        this.indices.setX(this._indexOffset, i2)
        this._indexOffset++
        this.indices.setX(this._indexOffset, i3)
        this._indexOffset++
        this.indices.setX(this._indexOffset, i4)
        this._indexOffset++
      }
    }
  }
}
