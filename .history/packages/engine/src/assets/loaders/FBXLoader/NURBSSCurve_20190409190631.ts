import * as THREE from 'three'
import autobind from 'autobind-decorator'
import { NURBSUtils } from './NURBSUtils'

@autobind
export class NURBSCurve {
  endKnot: any
  startKnot: any
  controlPoints: Array<THREE.Vector4>
  knots: any
  degree: any

  constructor(
    degree,
    knots /* array of reals */,
    controlPoints /* array of Vector(2|3|4) */,
    startKnot /* index in knots */,
    endKnot /* index in knots */
  ) {
    // THREE.Curve.call()

    this.degree = degree
    this.knots = knots
    this.controlPoints = []
    // Used by periodic NURBS to remove hidden spans
    this.startKnot = startKnot || 0
    this.endKnot = endKnot || this.knots.length - 1
    for (let i = 0; i < controlPoints.length; ++i) {
      // ensure Vector4 for control points
      const point = controlPoints[i]
      this.controlPoints[i] = new THREE.Vector4(
        point.x,
        point.y,
        point.z,
        point.w
      )
    }
  }

  getPoint(t) {
    const u =
      this.knots[this.startKnot] +
      t * (this.knots[this.endKnot] - this.knots[this.startKnot]) // linear mapping t->u

    const nurbsUtils = new NURBSUtils()
    // following results in (wx, wy, wz, w) homogeneous point
    const hpoint = nurbsUtils.calcBSplinePoint(
      this.degree,
      this.knots,
      this.controlPoints,
      u
    )

    if (hpoint.w != 1.0) {
      // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
      hpoint.divideScalar(hpoint.w)
    }

    return new THREE.Vector3(hpoint.x, hpoint.y, hpoint.z)
  }

  getTangent(t) {
    const u =
      this.knots[0] + t * (this.knots[this.knots.length - 1] - this.knots[0])

    const nurbsUtils = new NURBSUtils()
    const ders = nurbsUtils.calcNURBSDerivatives(
      this.degree,
      this.knots,
      this.controlPoints,
      u,
      1
    )
    const tangent = ders[1].clone()
    tangent.normalize()

    return tangent
  }
}
