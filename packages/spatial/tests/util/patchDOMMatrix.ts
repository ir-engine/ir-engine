/** Adapted from https://github.com/trusktr/geometry-interfaces */

// This matrix is represented internally in row-major format so that it is easy
// to look at visually. In a pair of coordinates (as in "m23") the first number
// is the column and the second is the row (so "m23" means column 2 row 3).
const identity = [
  /*m11*/ 1, /*m21*/ 0, /*m31*/ 0, /*m41*/ 0, /*m12*/ 0, /*m22*/ 1, /*m32*/ 0, /*m42*/ 0, /*m13*/ 0, /*m23*/ 0,
  /*m33*/ 1, /*m43*/ 0, /*m14*/ 0, /*m24*/ 0, /*m34*/ 0, /*m44*/ 1
]

export class DOMMatrixReadOnly {
  _matrix: Float64Array
  _isIdentity: boolean
  _is2D: boolean

  /**
   * @param {Array.number} numberSequence An array of numbers. If the array
   * has 6 items, then those items set the values of m11, m12, m21, m22, m41,
   * m42 in that order (or the values a, b, c, d, e, f if you're using those
   * aliases) and this.is2D is true. If the array has 16 items (in
   * column-major order), then they set all the values of the underlying
   * matrix (m11 to m44) and this.is2D is set false. Arrays of other lengths
   * throw an error.
   */
  constructor(numberSequence = [] as number[] | Float32Array | Float64Array) {
    if (!(this instanceof DOMMatrix))
      throw new TypeError(`DOMMatrixReadOnly can't be instantiated directly. Use DOMMatrix instead.`)

    const { length } = numberSequence

    if (length === undefined || !(length === 6 || length === 16))
      throw new TypeError('DOMMatrix constructor argument "numberSequence" must be an array-like with 6 or 16 numbers.')

    this._matrix = new Float64Array(identity)
    this._isIdentity = true
    this._is2D = length === 6 ? true : false

    applyArrayValuesToDOMMatrix(numberSequence, this)
  }

  // Immutable transform methods -------------------------------------------

  translate(tx, ty, tz = 0) {
    return new DOMMatrix(this).translateSelf(tx, ty, tz)
  }

  scale(scale, originX = 0, originY = 0) {
    return new DOMMatrix(this).scaleSelf(scale, originX, originY)
  }

  scale3d(scale, originX = 0, originY = 0, originZ = 0) {
    return new DOMMatrix(this).scale3dSelf(scale, originX, originY, originZ)
  }

  scaleNonUniform(scaleX, scaleY = 1, scaleZ = 1, originX = 0, originY = 0, originZ = 0) {
    return new DOMMatrix(this).scaleNonUniformSelf(scaleX, scaleY, scaleZ, originX, originY, originZ)
  }

  rotate(angle, originX = 0, originY = 0) {
    return new DOMMatrix(this).rotateSelf(angle, originX, originY)
  }

  // TODO
  rotateFromVector(x, y) {
    throw new Error('rotateFromVector is not implemented yet.')
  }

  rotateAxisAngle(x, y, z, angle) {
    return new DOMMatrix(this).rotateAxisAngleSelf(x, y, z, angle)
  }

  skewX(sx) {
    throw new Error('skewX is not implemented yet.')
  }
  skewY(sy) {
    throw new Error('skewY is not implemented yet.')
  }

  multiply(other) {
    return new DOMMatrix(this).multiplySelf(other)
  }

  flipX() {
    throw new Error('flipX is not implemented yet.')
  }
  flipY() {
    throw new Error('flipY is not implemented yet.')
  }
  inverse() {
    throw new Error('inverse is not implemented yet.')
  }

  transformPoint(/*optional DOMPointInit*/ point) {
    throw new Error('transformPoint is not implemented yet.')
  }

  toFloat32Array() {
    return Float32Array.from(this._matrix)
  }
  toFloat64Array() {
    return Float64Array.from(this._matrix)
  }

  //stringifier() {} // What's this?

  get is2D() {
    return this._is2D
  }

  /*
   * TODO: make sure this matches the spec.
   * TODO: Instead of calculating here, perhaps calculate and set
   * this._isIdentity in other operations, and simply return the internal one
   * here.
   */
  get isIdentity() {
    for (var i = 0, len = this._matrix.length; i < len; i += 1) {
      if (this._matrix[i] != identity[i]) return (this._isIdentity = false)
    }

    return (this._isIdentity = true)
  }

  get a() {
    return this.m11
  }
  get b() {
    return this.m12
  }
  get c() {
    return this.m21
  }
  get d() {
    return this.m22
  }
  get e() {
    return this.m41
  }
  get f() {
    return this.m42
  }

  get m11() {
    return this._matrix[0]
  }
  get m12() {
    return this._matrix[4]
  }
  get m13() {
    return this._matrix[8]
  }
  get m14() {
    return this._matrix[12]
  }

  get m21() {
    return this._matrix[1]
  }
  get m22() {
    return this._matrix[5]
  }
  get m23() {
    return this._matrix[9]
  }
  get m24() {
    return this._matrix[13]
  }

  get m31() {
    return this._matrix[2]
  }
  get m32() {
    return this._matrix[6]
  }
  get m33() {
    return this._matrix[10]
  }
  get m34() {
    return this._matrix[14]
  }

  get m41() {
    return this._matrix[3]
  }
  get m42() {
    return this._matrix[7]
  }
  get m43() {
    return this._matrix[11]
  }
  get m44() {
    return this._matrix[15]
  }
}

export class DOMMatrix extends DOMMatrixReadOnly {
  constructor(arg) {
    const numArgs = arguments.length
    if (numArgs === 0) {
      super([1, 0, 0, 1, 0, 0])
    } else if (numArgs === 1) {
      if (typeof arg == 'string') {
        throw new Error('CSS transformList arg not yet implemented.')
        // TODO validate that syntax of transformList matches transform-list (http://www.w3.org/TR/css-transforms-1/#typedef-transform-list).
      } else if (arg instanceof DOMMatrix) {
        super(arg._matrix)
      } else if (arg instanceof Float32Array || arg instanceof Float64Array || arg instanceof Array) {
        super(arg)
      }
    } else {
      throw new Error('Wrong number of arguments to DOMMatrix constructor.')
    }
  }

  // Mutable transform methods
  multiplySelf(other) {
    if (!(other instanceof DOMMatrix)) throw new Error('The argument to multiplySelf must be an instance of DOMMatrix')

    // TODO: avoid creating a new array, just apply values directly.
    multiplyAndApply(this, other, this)

    if (!other.is2D) this._is2D = false

    return this
  }

  preMultiplySelf(other) {
    if (!(other instanceof DOMMatrix)) throw new Error('The argument to multiplySelf must be an instance of DOMMatrix')

    // TODO: avoid creating a new array, just apply values directly.
    multiplyAndApply(other, this, this)

    if (!other.is2D) this._is2D = false

    return this
  }

  translateSelf(tx = 0, ty = 0, tz = 0) {
    // TODO: check args are numbers

    // http://www.w3.org/TR/2012/WD-css3-transforms-20120911/#Translate3dDefined
    const translationMatrix = new DOMMatrix([
      // column-major:
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      tx,
      ty,
      tz,
      1
    ])

    this.multiplySelf(translationMatrix)

    if (tz != 0) {
      this._is2D = false
    }

    return this
  }

  scaleSelf(scale, originX = 0, originY = 0) {
    this.translateSelf(originX, originY)

    this.multiplySelf(
      new DOMMatrix([
        // 2D:
        /*a*/ scale,
        /*b*/ 0,
        /*c*/ 0,
        /*d*/ scale,
        /*e*/ 0,
        /*f*/ 0
      ])
    )

    this.translateSelf(-originX, -originY)
    return this
  }

  scale3dSelf(scale, originX = 0, originY = 0, originZ = 0) {
    this.translateSelf(originX, originY, originZ)

    this.multiplySelf(
      new DOMMatrix([
        // 3D
        scale,
        0,
        0,
        0,
        0,
        scale,
        0,
        0,
        0,
        0,
        scale,
        0,
        0,
        0,
        0,
        1
      ])
    )

    this.translateSelf(-originX, -originY, -originZ)
    return this
  }

  scaleNonUniformSelf(scaleX, scaleY = 1, scaleZ = 1, originX = 0, originY = 0, originZ = 0) {
    this.translateSelf(originX, originY, originZ)

    this.multiplySelf(
      new DOMMatrix([
        // 3D
        scaleX,
        0,
        0,
        0,
        0,
        scaleY,
        0,
        0,
        0,
        0,
        scaleZ,
        0,
        0,
        0,
        0,
        1
      ])
    )

    this.translateSelf(-originX, -originY, -originZ)

    if (scaleZ !== 1 || originZ !== 0) this._is2D = false

    return this
  }

  rotateSelf(angle, originX = 0, originY = 0) {
    this.translateSelf(originX, originY)

    // axis of rotation
    const [x, y, z] = [0, 0, 1] // We're rotating around the Z axis.

    this.rotateAxisAngleSelf(x, y, z, angle)

    this.translateSelf(-originX, -originY)
    return this
  }

  // TODO
  rotateFromVectorSelf(x, y) {
    throw new Error('rotateFromVectorSelf is not implemented yet.')
  }

  rotateAxisAngleSelf(x, y, z, angle) {
    const rotationMatrix = new DOMMatrix(rotateAxisAngleArray(x, y, z, angle))
    this.multiplySelf(rotationMatrix)
    return this
  }

  skewXSelf(sx) {
    throw new Error('skewXSelf is not implemented yet.')
  }

  skewYSelf(sy) {
    throw new Error('skewYSelf is not implemented yet.')
  }

  invertSelf() {
    throw new Error('invertSelf is not implemented yet.')
  }

  setMatrixValue(/*DOMString*/ transformList) {
    throw new Error('setMatrixValue is not implemented yet.')
  }

  get a() {
    return this.m11
  }
  get b() {
    return this.m12
  }
  get c() {
    return this.m21
  }
  get d() {
    return this.m22
  }
  get e() {
    return this.m41
  }
  get f() {
    return this.m42
  }

  get m11() {
    return this._matrix[0]
  }
  get m12() {
    return this._matrix[4]
  }
  get m13() {
    return this._matrix[8]
  }
  get m14() {
    return this._matrix[12]
  }

  get m21() {
    return this._matrix[1]
  }
  get m22() {
    return this._matrix[5]
  }
  get m23() {
    return this._matrix[9]
  }
  get m24() {
    return this._matrix[13]
  }

  get m31() {
    return this._matrix[2]
  }
  get m32() {
    return this._matrix[6]
  }
  get m33() {
    return this._matrix[10]
  }
  get m34() {
    return this._matrix[14]
  }

  get m41() {
    return this._matrix[3]
  }
  get m42() {
    return this._matrix[7]
  }
  get m43() {
    return this._matrix[11]
  }
  get m44() {
    return this._matrix[15]
  }

  set a(value) {
    this.m11 = value
  }
  set b(value) {
    this.m12 = value
  }
  set c(value) {
    this.m21 = value
  }
  set d(value) {
    this.m22 = value
  }
  set e(value) {
    this.m41 = value
  }
  set f(value) {
    this.m42 = value
  }

  set m11(value) {
    this._matrix[0] = value
  }
  set m12(value) {
    this._matrix[4] = value
  }
  set m13(value) {
    this._matrix[8] = value
  }
  set m14(value) {
    this._matrix[12] = value
  }

  set m21(value) {
    this._matrix[1] = value
  }
  set m22(value) {
    this._matrix[5] = value
  }
  set m23(value) {
    this._matrix[9] = value
  }
  set m24(value) {
    this._matrix[13] = value
  }

  set m31(value) {
    this._matrix[2] = value
  }
  set m32(value) {
    this._matrix[6] = value
  }
  set m33(value) {
    this._matrix[10] = value
  }
  set m34(value) {
    this._matrix[14] = value
  }

  set m41(value) {
    this._matrix[3] = value
  }
  set m42(value) {
    this._matrix[7] = value
  }
  set m43(value) {
    this._matrix[11] = value
  }
  set m44(value) {
    this._matrix[15] = value
  }
}

let privatesMap
const _ = (o) => {
  if (!privatesMap) {
    privatesMap = new WeakMap()
    let privates = {}
    privatesMap.set(o, privates)
    return privates
  } else {
    let privates = privatesMap.get(o)

    if (privates === undefined) {
      privates = {}
      privatesMap.set(o, privates)
    }

    return privates
  }
}

export class DOMPointReadOnly {
  constructor(x?: number, y?: number, z?: number, w?: number) {
    _(this).x = x !== undefined ? Number(x) : 0
    _(this).y = y !== undefined ? Number(y) : 0
    _(this).z = z !== undefined ? Number(z) : 0
    _(this).w = w !== undefined ? Number(w) : 1
  }

  get x() {
    return _(this).x
  }
  get y() {
    return _(this).y
  }
  get z() {
    return _(this).z
  }
  get w() {
    return _(this).w
  }

  matrixTransform(matrix: DOMMatrixReadOnly) {
    throw new Error('matrixTransform is not implemented yet.')
    // const constructor = this.constructor as typeof DOMPointReadOnly

    // const x = _(this).x
    // const y = _(this).y
    // const z = _(this).z
    // const w = _(this).w

    // return new constructor(
    //   matrix.m11 * x + matrix.m21 * y + matrix.m31 * z + matrix.m41 * w,
    //   matrix.m12 * x + matrix.m22 * y + matrix.m32 * z + matrix.m42 * w,
    //   matrix.m13 * x + matrix.m23 * y + matrix.m33 * z + matrix.m43 * w,
    //   matrix.m14 * x + matrix.m24 * y + matrix.m34 * z + matrix.m44 * w,
    // )
  }

  toJSON() {
    return Object.assign({}, _(this))
  }

  static fromPoint(other) {
    return new this(other.x, other.y, other.z, other.w)
  }
}

export class DOMPoint extends DOMPointReadOnly {
  get x() {
    return super.x
  }
  get y() {
    return super.y
  }
  get z() {
    return super.z
  }
  get w() {
    return super.w
  }

  set x(value) {
    _(this).x = Number(value)
  }
  set y(value) {
    _(this).y = Number(value)
  }
  set z(value) {
    _(this).z = Number(value)
  }
  set w(value) {
    _(this).w = Number(value)
  }
}

// A reusable array, to avoid allocating new arrays during multiplication.
// in column-major order:
const scratch = [
  /*m11*/ 0, /*m12*/ 0, /*m13*/ 0, /*m14*/ 0, /*m21*/ 0, /*m22*/ 0, /*m23*/ 0, /*m24*/ 0, /*m31*/ 0, /*m32*/ 0,
  /*m33*/ 0, /*m34*/ 0, /*m41*/ 0, /*m42*/ 0, /*m43*/ 0, /*m44*/ 0
]

export function multiplyAndApply(A, B, target) {
  //XXX: Are the following calculations faster hard coded (current), or as a loop?

  scratch[0] = A.m11 * B.m11 + A.m21 * B.m12 + A.m31 * B.m13 + A.m41 * B.m14
  scratch[4] = A.m11 * B.m21 + A.m21 * B.m22 + A.m31 * B.m23 + A.m41 * B.m24
  scratch[8] = A.m11 * B.m31 + A.m21 * B.m32 + A.m31 * B.m33 + A.m41 * B.m34
  scratch[12] = A.m11 * B.m41 + A.m21 * B.m42 + A.m31 * B.m43 + A.m41 * B.m44

  scratch[1] = A.m12 * B.m11 + A.m22 * B.m12 + A.m32 * B.m13 + A.m42 * B.m14
  scratch[5] = A.m12 * B.m21 + A.m22 * B.m22 + A.m32 * B.m23 + A.m42 * B.m24
  scratch[9] = A.m12 * B.m31 + A.m22 * B.m32 + A.m32 * B.m33 + A.m42 * B.m34
  scratch[13] = A.m12 * B.m41 + A.m22 * B.m42 + A.m32 * B.m43 + A.m42 * B.m44

  scratch[2] = A.m13 * B.m11 + A.m23 * B.m12 + A.m33 * B.m13 + A.m43 * B.m14
  scratch[6] = A.m13 * B.m21 + A.m23 * B.m22 + A.m33 * B.m23 + A.m43 * B.m24
  scratch[10] = A.m13 * B.m31 + A.m23 * B.m32 + A.m33 * B.m33 + A.m43 * B.m34
  scratch[14] = A.m13 * B.m41 + A.m23 * B.m42 + A.m33 * B.m43 + A.m43 * B.m44

  scratch[3] = A.m14 * B.m11 + A.m24 * B.m12 + A.m34 * B.m13 + A.m44 * B.m14
  scratch[7] = A.m14 * B.m21 + A.m24 * B.m22 + A.m34 * B.m23 + A.m44 * B.m24
  scratch[11] = A.m14 * B.m31 + A.m24 * B.m32 + A.m34 * B.m33 + A.m44 * B.m34
  scratch[15] = A.m14 * B.m41 + A.m24 * B.m42 + A.m34 * B.m43 + A.m44 * B.m44

  applyArrayValuesToDOMMatrix(scratch, target)
}

function applyArrayValuesToDOMMatrix(array, matrix) {
  const length = array.length

  if (length === 6) {
    matrix.m11 = array[0]
    matrix.m12 = array[1]
    matrix.m21 = array[2]
    matrix.m22 = array[3]
    matrix.m41 = array[4]
    matrix.m42 = array[5]
  } else if (length === 16) {
    matrix.m11 = array[0]
    matrix.m12 = array[1]
    matrix.m13 = array[2]
    matrix.m14 = array[3]
    matrix.m21 = array[4]
    matrix.m22 = array[5]
    matrix.m23 = array[6]
    matrix.m24 = array[7]
    matrix.m31 = array[8]
    matrix.m32 = array[9]
    matrix.m33 = array[10]
    matrix.m34 = array[11]
    matrix.m41 = array[12]
    matrix.m42 = array[13]
    matrix.m43 = array[14]
    matrix.m44 = array[15]
  }
}

function rotateAxisAngleArray(x, y, z, angle) {
  const { sin, cos, pow } = Math

  const halfAngle = degreesToRadians(angle / 2)

  // TODO: should we provide a 6-item array here to signify 2D when the
  // rotation is about the Z axis (for example when calling rotateSelf)?
  // TODO: Performance can be improved by first detecting when x, y, or z of
  // the axis are zero or 1, and using a pre-simplified version of the
  // folowing math based on that condition.
  // TODO: Performance can be improved by using different equations (use trig
  // identities to find alternate formulas).
  return [
    1 - 2 * (y * y + z * z) * pow(sin(halfAngle), 2),
    2 * (x * y * pow(sin(halfAngle), 2) + z * sin(halfAngle) * cos(halfAngle)),
    2 * (x * z * pow(sin(halfAngle), 2) - y * sin(halfAngle) * cos(halfAngle)),
    0,
    2 * (x * y * pow(sin(halfAngle), 2) - z * sin(halfAngle) * cos(halfAngle)),
    1 - 2 * (x * x + z * z) * pow(sin(halfAngle), 2),
    2 * (y * z * pow(sin(halfAngle), 2) + x * sin(halfAngle) * cos(halfAngle)),
    0,
    2 * (x * z * pow(sin(halfAngle), 2) + y * sin(halfAngle) * cos(halfAngle)),
    2 * (y * z * pow(sin(halfAngle), 2) - x * sin(halfAngle) * cos(halfAngle)),
    1 - 2 * (x * x + y * y) * pow(sin(halfAngle), 2),
    0,
    0,
    0,
    0,
    1
  ]
}

function degreesToRadians(degrees) {
  return (Math.PI / 180) * degrees
}
