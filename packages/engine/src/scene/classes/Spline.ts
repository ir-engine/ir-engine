import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Line, LineBasicMaterial, Object3D, Vector3 } from 'three'

import { removeElementFromArray } from '@xrengine/common/src/utils/removeElementFromArray'

import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import SplineHelper from './SplineHelper'

const _point = new Vector3()

export default class Spline extends Object3D {
  ARC_SEGMENTS = 200
  INIT_POINTS_COUNT = 2

  _splineHelperObjects: Object3D[] = []
  _splinePointsLength = this.INIT_POINTS_COUNT
  _positions: Vector3[] = []

  mesh: Line
  curve: CatmullRomCurve3

  init(loadedSplinePositions: Vector3[] = [], curveType = 'catmullrom' as 'catmullrom' | 'centripetal' | 'chordal') {
    if (this.mesh) {
      super.remove(this.mesh)
    }

    console.log(loadedSplinePositions)

    this._splinePointsLength = loadedSplinePositions.length

    for (let i = 0; i < this._splinePointsLength; i++) {
      this.addSplineObject(this._positions[i])
    }

    this._positions.length = 0

    for (let i = 0; i < this._splinePointsLength; i++) {
      this._positions.push(this._splineHelperObjects[i].position)
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3))

    const catmullRomCurve3 = new CatmullRomCurve3(this._positions)
    ;(catmullRomCurve3 as any).curveType = curveType
    const curveMesh = new Line(
      geometry.clone(),
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
    } else {
      this.load([new Vector3(-1, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0)])
    }
  }

  getCurrentSplineHelperObjects(): Object3D[] {
    return this._splineHelperObjects
  }

  addSplineObject(position?: Vector3): SplineHelper {
    const splineHelperNode = new SplineHelper()
    setObjectLayers(splineHelperNode, ObjectLayers.NodeHelper)
    const object = splineHelperNode

    if (position) {
      object.position.copy(position)
    }

    object.castShadow = true
    object.receiveShadow = true
    super.add(object)
    this._splineHelperObjects.push(object)
    return object
  }

  addPoint(): SplineHelper {
    this._splinePointsLength++

    const newSplineObject = this.addSplineObject()
    this._positions.push(newSplineObject.position)

    this.updateSplineOutline()

    return newSplineObject
  }

  removeLastPoint(): void {
    if (this._splinePointsLength <= this.INIT_POINTS_COUNT) {
      return
    }

    const point = this._splineHelperObjects.pop()!
    this._splinePointsLength--
    this._positions.pop()

    super.remove(point)

    this.updateSplineOutline()
  }

  removePoint(splineHelperNode?: SplineHelper): void {
    if (this._splinePointsLength <= this.INIT_POINTS_COUNT) {
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

  updateSplineOutline(): void {
    const splineMesh = this.mesh
    const position = splineMesh.geometry.attributes.position

    const splineCurve = this.curve

    if (splineCurve.points.length <= 2) return

    for (let i = 0; i < this.ARC_SEGMENTS; i++) {
      const t = i / (this.ARC_SEGMENTS - 1)
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
