import { Color, Object3D, Raycaster, Vector3, Intersection, Mesh, MeshStandardMaterial } from 'three'
import { LoadGLTF } from '../../assets/functions/LoadGLTF'
import {
  TransformAxis,
  TransformAxisType,
  TransformMode,
  TransformModeType
} from '../../scene/constants/transformConstants'
import cloneObject3D from '../../scene/functions/cloneObject3D'

type AxisInfo = {
  axis: TransformAxisType
  planeNormal: Vector3
  selectionColorTarget: MeshStandardMaterial
  rotationTarget?: Object3D
  startMarker?: Object3D
  startMarkerLocal?: Object3D
  endMarker?: Object3D
  rotationStartObject?: Object3D
  rotationEndObject?: Object3D
}
type MeshWithAxisInfo = Mesh & { axisInfo: AxisInfo }

let gizmoGltf: { scene: any; json: any; stats: any } = null!
const GLTF_PATH = '/static/editor/TransformGizmo.glb' // STATIC
export default class TransformGizmo extends Object3D {
  model: Object3D
  selectionColor: Color
  previousColor: Color
  raycasterResults: Intersection<Object3D>[]

  translateControls: Object3D
  translateXAxis: MeshWithAxisInfo
  translateYAxis: MeshWithAxisInfo
  translateZAxis: MeshWithAxisInfo
  translateXYPlane: MeshWithAxisInfo
  translateYZPlane: MeshWithAxisInfo
  translateXZPlane: MeshWithAxisInfo

  rotateControls: Object3D
  rotateXAxis: Object3D
  rotateYAxis: Object3D
  rotateZAxis: Object3D

  scaleControls: Object3D
  scaleXAxis: MeshWithAxisInfo
  scaleYAxis: MeshWithAxisInfo
  scaleZAxis: MeshWithAxisInfo
  scaleXYPlane: MeshWithAxisInfo
  scaleYZPlane: MeshWithAxisInfo
  scaleXZPlane: MeshWithAxisInfo
  scaleUniformHandle: MeshWithAxisInfo

  transformMode: TransformModeType
  activeControls?: Object3D
  selectedAxisObj?: MeshWithAxisInfo
  hoveredAxis: MeshWithAxisInfo

  static async load() {
    if (gizmoGltf) return Promise.resolve(gizmoGltf)
    gizmoGltf = await LoadGLTF(GLTF_PATH)
    return gizmoGltf
  }

  constructor() {
    super()
    ;(this as any).name = 'TransformGizmo'
    if (!gizmoGltf) {
      throw new Error('TransformGizmo must be loaded before it can be used. Await TransformGizmo.load()')
    }
    this.model = cloneObject3D(gizmoGltf.scene)
    this.add(this.model)
    this.selectionColor = new Color().setRGB(1, 1, 1)
    this.previousColor = new Color()
    this.raycasterResults = []
    this.translateControls = this.model.getObjectByName('TranslateControls')!

    this.translateXAxis = this.translateControls.getObjectByName('TranslateXAxis') as MeshWithAxisInfo
    this.translateXAxis.axisInfo = {
      axis: TransformAxis.X,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateXAxis.material as MeshStandardMaterial
    }

    this.translateYAxis = this.translateControls.getObjectByName('TranslateYAxis') as MeshWithAxisInfo
    this.translateYAxis.axisInfo = {
      axis: TransformAxis.Y,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.translateYAxis.material as MeshStandardMaterial
    }

    this.translateZAxis = this.translateControls.getObjectByName('TranslateZAxis') as MeshWithAxisInfo
    this.translateZAxis.axisInfo = {
      axis: TransformAxis.Z,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateZAxis.material as MeshStandardMaterial
    }

    this.translateXYPlane = this.translateControls.getObjectByName('TranslateXYPlane') as MeshWithAxisInfo
    this.translateXYPlane.axisInfo = {
      axis: TransformAxis.XY,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.translateXYPlane.material as MeshStandardMaterial
    }

    this.translateYZPlane = this.translateControls.getObjectByName('TranslateYZPlane') as MeshWithAxisInfo
    this.translateYZPlane.axisInfo = {
      axis: TransformAxis.YZ,
      planeNormal: new Vector3(1, 0, 0),
      selectionColorTarget: this.translateYZPlane.material as MeshStandardMaterial
    }

    this.translateXZPlane = this.translateControls.getObjectByName('TranslateXZPlane') as MeshWithAxisInfo
    this.translateXZPlane.axisInfo = {
      axis: TransformAxis.XZ,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateXZPlane.material as MeshStandardMaterial
    }

    this.rotateControls = this.model.getObjectByName('RotateControls')!
    this.rotateXAxis = this.rotateControls.getObjectByName('RotateXAxis')!
    const rotateXAxisDisk = this.rotateXAxis.getObjectByName('RotateXAxisDisk') as MeshWithAxisInfo
    const rotateXAxisStart = this.rotateXAxis.getObjectByName('RotateXAxisStart')!
    const rotateXAxisEnd = this.rotateXAxis.getObjectByName('RotateXAxisEnd')!

    const localRotateXAxisStart = rotateXAxisStart.clone()
    rotateXAxisDisk.axisInfo = {
      axis: TransformAxis.X,
      planeNormal: new Vector3(1, 0, 0),
      rotationTarget: rotateXAxisDisk,
      startMarker: rotateXAxisStart,
      startMarkerLocal: localRotateXAxisStart,
      endMarker: rotateXAxisEnd,
      selectionColorTarget: rotateXAxisDisk.material as MeshStandardMaterial
    }

    this.rotateYAxis = this.rotateControls.getObjectByName('RotateYAxis')!
    const rotateYAxisDisk = this.rotateYAxis.getObjectByName('RotateYAxisDisk') as MeshWithAxisInfo
    const rotateYAxisStart = this.rotateYAxis.getObjectByName('RotateYAxisStart')!
    const rotateYAxisEnd = this.rotateYAxis.getObjectByName('RotateYAxisEnd')!

    const localRotateYAxisStart = rotateYAxisStart.clone()
    rotateYAxisDisk.axisInfo = {
      axis: TransformAxis.Y,
      planeNormal: new Vector3(0, 1, 0),
      rotationTarget: rotateYAxisDisk,
      startMarker: rotateYAxisStart,
      startMarkerLocal: localRotateYAxisStart,
      endMarker: rotateYAxisEnd,
      selectionColorTarget: rotateYAxisDisk.material as MeshStandardMaterial
    }

    this.rotateZAxis = this.rotateControls.getObjectByName('RotateZAxis')!
    const rotateZAxisDisk = this.rotateZAxis.getObjectByName('RotateZAxisDisk') as MeshWithAxisInfo
    const rotateZAxisStart = this.rotateZAxis.getObjectByName('RotateZAxisStart')!
    const rotateZAxisEnd = this.rotateZAxis.getObjectByName('RotateZAxisEnd')!

    const localRotateZAxisStart = rotateZAxisStart.clone()
    rotateZAxisDisk.axisInfo = {
      axis: TransformAxis.Z,
      planeNormal: new Vector3(0, 0, 1),
      rotationTarget: rotateZAxisDisk,
      startMarker: rotateZAxisStart,
      startMarkerLocal: localRotateZAxisStart,
      endMarker: rotateZAxisEnd,
      selectionColorTarget: rotateZAxisDisk.material as MeshStandardMaterial
    }

    this.scaleControls = this.model.getObjectByName('ScaleControls')!
    this.scaleXAxis = this.scaleControls.getObjectByName('ScaleXAxis') as MeshWithAxisInfo
    this.scaleXAxis.axisInfo = {
      axis: TransformAxis.X,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.scaleXAxis.material as MeshStandardMaterial
    }

    this.scaleYAxis = this.scaleControls.getObjectByName('ScaleYAxis') as MeshWithAxisInfo
    this.scaleYAxis.axisInfo = {
      axis: TransformAxis.Y,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.scaleYAxis.material as MeshStandardMaterial
    }

    this.scaleZAxis = this.scaleControls.getObjectByName('ScaleZAxis') as MeshWithAxisInfo
    this.scaleZAxis.axisInfo = {
      axis: TransformAxis.Z,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.scaleZAxis.material as MeshStandardMaterial
    }

    this.scaleXYPlane = this.scaleControls.getObjectByName('ScaleXYPlane') as MeshWithAxisInfo
    this.scaleXYPlane.axisInfo = {
      axis: TransformAxis.XY,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.scaleXYPlane.material as MeshStandardMaterial
    }

    this.scaleYZPlane = this.scaleControls.getObjectByName('ScaleYZPlane') as MeshWithAxisInfo
    this.scaleYZPlane.axisInfo = {
      axis: TransformAxis.YZ,
      planeNormal: new Vector3(1, 0, 0),
      selectionColorTarget: this.scaleYZPlane.material as MeshStandardMaterial
    }

    this.scaleXZPlane = this.scaleControls.getObjectByName('ScaleXZPlane') as MeshWithAxisInfo
    this.scaleXZPlane.axisInfo = {
      axis: TransformAxis.XZ,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.scaleXZPlane.material as MeshStandardMaterial
    }

    this.scaleUniformHandle = this.scaleControls.getObjectByName('ScaleUniformHandle') as MeshWithAxisInfo
    this.scaleUniformHandle.axisInfo = {
      axis: TransformAxis.XYZ,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.scaleUniformHandle.material as MeshStandardMaterial
    }

    rotateXAxisStart.visible = false
    rotateXAxisEnd.visible = false
    rotateYAxisStart.visible = false
    rotateYAxisEnd.visible = false
    rotateZAxisStart.visible = false
    rotateZAxisEnd.visible = false

    this.translateControls.visible = true
    this.rotateControls.visible = false
    this.scaleControls.visible = false

    this.transformMode = TransformMode.Disabled

    this.model.traverse((obj: Mesh) => {
      if (obj.isMesh) {
        // obj.layers.set(1);
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            m.depthTest = false
            m.depthWrite = false
          })
        } else {
          obj.material.depthTest = false
          obj.material.depthWrite = false
        }

        obj.renderOrder = 100
      }
    })
  }

  get selectedAxis() {
    return this.selectedAxisObj?.axisInfo.axis
  }

  get selectedPlaneNormal() {
    return this.selectedAxisObj?.axisInfo.planeNormal
  }

  setTransformMode(transformMode: TransformModeType): void {
    this.transformMode = transformMode
    this.translateControls.visible = false
    this.rotateControls.visible = false
    this.scaleControls.visible = false

    switch (transformMode) {
      case TransformMode.Translate:
        this.translateControls.visible = true
        this.activeControls = this.translateControls
        break
      case TransformMode.Rotate:
        this.rotateControls.visible = true
        this.activeControls = this.rotateControls
        break
      case TransformMode.Scale:
        this.scaleControls.visible = true
        this.activeControls = this.scaleControls
        break
      default:
        this.selectedAxisObj = undefined
        this.activeControls = undefined
        break
    }
  }

  setLocalScaleHandlesVisible(visible: boolean): void {
    this.scaleXAxis.visible = visible
    this.scaleYAxis.visible = visible
    this.scaleZAxis.visible = visible
    this.scaleXYPlane.visible = visible
    this.scaleYZPlane.visible = visible
    this.scaleXZPlane.visible = visible
  }

  selectAxisWithRaycaster(raycaster: Raycaster): TransformAxisType | undefined {
    this.deselectAxis()

    if (!this.activeControls) return

    this.raycasterResults.length = 0
    this.raycasterResults = raycaster.intersectObject(this.activeControls, true, this.raycasterResults)
    const axisResult = this.raycasterResults.find(
      (result) => (result.object as MeshWithAxisInfo).axisInfo !== undefined
    )

    if (!axisResult) return

    this.selectedAxisObj = axisResult.object as MeshWithAxisInfo
    const newAxisInfo = this.selectedAxisObj.axisInfo

    this.previousColor.copy(newAxisInfo.selectionColorTarget.color)

    newAxisInfo.selectionColorTarget.color.copy(this.selectionColor)
    if (newAxisInfo.rotationStartObject) newAxisInfo.rotationStartObject.visible = true
    if (newAxisInfo.rotationEndObject) newAxisInfo.rotationEndObject.visible = true

    return newAxisInfo.axis
  }

  highlightHoveredAxis(raycaster: Raycaster): void {
    if (!this.activeControls) return

    if (this.hoveredAxis) {
      this.hoveredAxis.axisInfo.selectionColorTarget.opacity = 0.5
    }

    this.raycasterResults.length = 0
    this.raycasterResults = raycaster.intersectObject(this.activeControls, true, this.raycasterResults)

    const axisResult = this.raycasterResults.find(
      (result) => (result.object as MeshWithAxisInfo).axisInfo !== undefined
    )

    if (!axisResult) return

    this.hoveredAxis = axisResult.object as MeshWithAxisInfo
    this.hoveredAxis.axisInfo.selectionColorTarget.opacity = 1
  }

  deselectAxis(): void {
    if (this.selectedAxisObj) {
      const oldAxisInfo = this.selectedAxisObj.axisInfo
      oldAxisInfo.selectionColorTarget.color.copy(this.previousColor)
      if (oldAxisInfo.rotationStartObject) {
        oldAxisInfo.rotationStartObject.visible = false
      }
      if (oldAxisInfo.rotationEndObject) {
        oldAxisInfo.rotationEndObject.visible = false
      }
      this.selectedAxisObj = undefined
    }
  }

  clone() {
    // You can only have one instance of TransformControls so return a dummy object when cloning.
    return new Object3D().copy(this) as TransformGizmo
  }
}
