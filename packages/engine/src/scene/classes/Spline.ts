import { Vector3, BufferGeometry, BufferAttribute, CatmullRomCurve3, Line, LineBasicMaterial, Object3D } from 'three'
import { removeElementFromArray } from '@xrengine/common/src/utils/removeElementFromArray'
import SplineHelper from './SplineHelper'
import { ObjectLayers } from '../constants/ObjectLayers'

export default class Spline extends Object3D {
  ARC_SEGMENTS = 200
  INIT_POINTS_COUNT = 2

  _splineHelperObjects: Object3D[] = []
  _splinePointsLength = this.INIT_POINTS_COUNT
  _positions: Vector3[] = []
  _point = new Vector3()

  _splines = {} as any

  init(loadedSplinePositions: Vector3[] = []) {
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
    // curve.curveType = 'catmullrom';
    const curveMesh = new Line(
      geometry.clone(),
      new LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
      })
    )
    curveMesh.castShadow = true

    const spline = {
      curve: catmullRomCurve3,
      mesh: curveMesh
    }

    this._splines.uniform = spline

    // curve = new CatmullRomCurve3( this._positions );
    // curve.curveType = 'centripetal';
    // curve.mesh = new Line( geometry.clone(), new LineBasicMaterial( {
    // 	color: 0x00ff00,
    // 	opacity: 0.35
    // } ) );
    // curve.mesh.castShadow = true;
    // this._splines.centripetal = curve;

    // curve = new CatmullRomCurve3( this._positions );
    // curve.curveType = 'chordal';
    // curve.mesh = new Line( geometry.clone(), new LineBasicMaterial( {
    // 	color: 0x0000ff,
    // 	opacity: 0.35
    // } ) );
    // curve.mesh.castShadow = true;
    // this._splines.chordal = curve;

    for (const k in this._splines) {
      const spline = this._splines[k]
      spline.mesh.layers.set(ObjectLayers.NodeHelper)
      super.add(spline.mesh)
    }

    if (loadedSplinePositions != null) {
      this.load(loadedSplinePositions)
    } else {
      this.load([
        new Vector3(0, 0.514, 0.10018915737797),
        new Vector3(1.56300074753207, 1.49711742836848, 1.495472686253045)
      ])
    }
  }

  getCurrentSplineHelperObjects(): Object3D[] {
    return this._splineHelperObjects
  }

  addSplineObject(position?: Vector3): SplineHelper {
    const splineHelperNode = new SplineHelper()
    const object = splineHelperNode

    if (position) {
      object.position.copy(position)
    } else {
      object.position.x = Math.random() * 10 - 5
      object.position.y = Math.random() * 6
      object.position.z = Math.random() * 8 - 4
    }

    object.castShadow = true
    object.receiveShadow = true
    // super.add( object );
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

    const point = this._splineHelperObjects.pop()
    this._splinePointsLength--
    this._positions.pop()

    // super.remove( point );

    this.updateSplineOutline()
  }

  removePoint(splineHelperNode?: SplineHelper): void {
    if (this._splinePointsLength <= this.INIT_POINTS_COUNT) {
      return
    }

    removeElementFromArray(this._splineHelperObjects, splineHelperNode)
    this._splinePointsLength--

    if (splineHelperNode) removeElementFromArray(this._positions, splineHelperNode.position)

    // This is done from onRemove of editor
    // super.remove( splineHelperNode );

    this.updateSplineOutline()
  }

  updateSplineOutline(): void {
    for (const k in this._splines) {
      const spline = this._splines[k]

      const splineMesh = spline.mesh
      const position = splineMesh.geometry.attributes.position

      const splineCurve = spline.curve

      for (let i = 0; i < this.ARC_SEGMENTS; i++) {
        const t = i / (this.ARC_SEGMENTS - 1)
        splineCurve.getPoint(t, this._point)
        position.setXYZ(i, this._point.x, this._point.y, this._point.z)
      }

      position.needsUpdate = true
    }
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
