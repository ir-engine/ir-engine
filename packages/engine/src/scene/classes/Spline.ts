import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Vector3
} from 'three'

import { removeElementFromArray } from '@xrengine/common/src/utils/removeElementFromArray'

import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

const _point = new Vector3()

const helperGeometry = new BoxGeometry(0.1, 0.1, 0.1)
const helperMaterial = new MeshLambertMaterial({ color: 'white' })
const ARC_SEGMENTS = 200

const lineGeometry = new BufferGeometry()
lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))

export default class Spline extends Object3D {
  _splineHelperObjects: Object3D[] = []
  _splinePointsLength = 0
  _positions: Vector3[] = []

  mesh: Line
  curve: CatmullRomCurve3

  constructor(
    loadedSplinePositions: Vector3[] = [],
    curveType = 'catmullrom' as 'catmullrom' | 'centripetal' | 'chordal'
  ) {
    super()

    this._splinePointsLength = loadedSplinePositions.length

    for (let i = 0; i < this._splinePointsLength; i++) {
      this.addSplineObject(this._positions[i])
    }

    this._positions.length = 0

    for (let i = 0; i < this._splinePointsLength; i++) {
      this._positions.push(this._splineHelperObjects[i].position)
    }

    const catmullRomCurve3 = new CatmullRomCurve3(this._positions)
    ;(catmullRomCurve3 as any).curveType = curveType
    const curveMesh = new Line(
      lineGeometry.clone(),
      new LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
      })
    )
    curveMesh.castShadow = true
    this.mesh = curveMesh
    this.curve = catmullRomCurve3

    this.mesh.layers.set(ObjectLayers.NodeHelper)
    super.add(this.mesh)

    if (loadedSplinePositions.length) {
      this.load(loadedSplinePositions)
    }
  }

  getCurrentSplineHelperObjects() {
    return this._splineHelperObjects
  }

  addSplineObject(position?: Vector3) {
    const splineHelperNode = new Mesh(helperGeometry, helperMaterial)
    setObjectLayers(splineHelperNode, ObjectLayers.NodeHelper)
    const object = splineHelperNode

    if (position) {
      object.position.copy(position)
    }

    object.castShadow = true
    object.receiveShadow = true
    super.add(object)
    this._splineHelperObjects.push(object)
    console.log(this._splineHelperObjects)
    return object
  }

  addPoint() {
    this._splinePointsLength++

    const newSplineObject = this.addSplineObject()
    this._positions.push(newSplineObject.position)

    this.updateSplineOutline()
  }

  removeLastPoint() {
    if (this._splinePointsLength <= 0) {
      return
    }

    const point = this._splineHelperObjects.pop()!
    this._splinePointsLength--
    this._positions.pop()

    super.remove(point)

    this.updateSplineOutline()
  }

  removePoint(splineHelperNode?: Mesh) {
    if (this._splinePointsLength <= 0) {
      return
    }

    removeElementFromArray(this._splineHelperObjects, splineHelperNode)
    this._splinePointsLength--

    if (splineHelperNode) {
      removeElementFromArray(this._positions, splineHelperNode.position)

      super.remove(splineHelperNode)
    }

    this.updateSplineOutline()
  }

  updateSplineOutline() {
    const splineMesh = this.mesh
    const position = splineMesh.geometry.attributes.position

    const splineCurve = this.curve
    splineMesh.visible = splineCurve.points.length >= 2

    if (splineCurve.points.length <= 2) return

    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const t = i / (ARC_SEGMENTS - 1)
      splineCurve.getPoint(t, _point)
      position.setXYZ(i, _point.x, _point.y, _point.z)
    }

    position.needsUpdate = true
    this.updateMatrixWorld()
  }

  exportSpline(): Vector3[] {
    const strplace: Vector3[] = []

    for (let i = 0; i < this._splinePointsLength; i++) {
      const p = this._splineHelperObjects[i].position
      strplace.push(p)
    }

    return strplace
  }

  load(new_positions: Vector3[]): void {
    while (new_positions.length > this._positions.length) {
      this.addPoint()
    }

    while (new_positions.length < this._positions.length) {
      this.removeLastPoint()
    }

    for (let i = 0; i < this._positions.length; i++) {
      this._positions[i].copy(new_positions[i])
    }

    this.updateSplineOutline()
  }
}
