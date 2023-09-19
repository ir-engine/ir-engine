/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Intersection,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3
} from 'three'

import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import {
  TransformAxisActionType,
  TransformAxisType,
  TransformMode,
  TransformModeType,
  TransformSpace
} from '../../scene/constants/transformConstants'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

type AxisInfo = {
  type: TransformAxisActionType
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

let gizmoGltf: GLTF = null!
const GLTF_PATH = '/static/editor/TransformGizmo.glb' // STATIC
export default class TransformGizmo extends Object3D {
  gizmo: any
  picker: any
  helper: any
  raycaster: Raycaster
  raycasterResults: Intersection<Object3D>[]
  translateControls: Object3D
  rotateControls: Object3D
  scaleControls: Object3D
  mode: TransformModeType
  space: TransformSpace
  worldQuaternion: any
  axis: any
  dragging: any
  showX: boolean
  showY: boolean
  showZ: boolean
  enabled: any

  constructor() {
    super()
    this.name = 'TransformGizmo'
    this.load()
  }

  async create() {
    const gizmoMaterial = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    })

    const gizmoLineMaterial = new LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true
    })

    // Make unique material for each axis/color

    const matInvisible = gizmoMaterial.clone()
    matInvisible.opacity = 0.15

    const matHelper = gizmoLineMaterial.clone()
    matHelper.opacity = 0.5

    const matRed = gizmoMaterial.clone()
    matRed.color.setHex(0xff0000)

    const matGreen = gizmoMaterial.clone()
    matGreen.color.setHex(0x00ff00)

    const matBlue = gizmoMaterial.clone()
    matBlue.color.setHex(0x0000ff)

    const matRedTransparent = gizmoMaterial.clone()
    matRedTransparent.color.setHex(0xff0000)
    matRedTransparent.opacity = 0.5

    const matGreenTransparent = gizmoMaterial.clone()
    matGreenTransparent.color.setHex(0x00ff00)
    matGreenTransparent.opacity = 0.5

    const matBlueTransparent = gizmoMaterial.clone()
    matBlueTransparent.color.setHex(0x0000ff)
    matBlueTransparent.opacity = 0.5

    const matWhiteTransparent = gizmoMaterial.clone()
    matWhiteTransparent.opacity = 0.25

    const matYellowTransparent = gizmoMaterial.clone()
    matYellowTransparent.color.setHex(0xffff00)
    matYellowTransparent.opacity = 0.25

    const matYellow = gizmoMaterial.clone()
    matYellow.color.setHex(0xffff00)

    const matGray = gizmoMaterial.clone()
    matGray.color.setHex(0x787878)

    // reusable geometry
    const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12)
    arrowGeometry.translate(0, 0.05, 0)

    const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08)
    scaleHandleGeometry.translate(0, 0.04, 0)

    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))

    const lineGeometry2 = new CylinderGeometry(0.0075, 0.0075, 0.5, 3)
    lineGeometry2.translate(0, 0.25, 0)

    function CircleGeometry(radius, arc) {
      const geometry = new TorusGeometry(radius, 0.0075, 3, 64, arc * Math.PI * 2)
      geometry.rotateY(Math.PI / 2)
      geometry.rotateX(Math.PI / 2)
      return geometry
    }

    // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

    function TranslateHelperGeometry() {
      const geometry = new BufferGeometry()

      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3))

      return geometry
    }

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function

    const gizmoTranslate = {
      X: [
        [new Mesh(arrowGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(arrowGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new Mesh(arrowGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(arrowGeometry, matGreen), [0, -0.5, 0], [Math.PI, 0, 0]],
        [new Mesh(lineGeometry2, matGreen)]
      ],
      Z: [
        [new Mesh(arrowGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(arrowGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [[new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()), [0, 0, 0]]],
      XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent.clone()), [0.15, 0.15, 0]]],
      YZ: [
        [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [
          new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent.clone()),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0]
        ]
      ]
    }

    const pickerTranslate = {
      X: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [[new Mesh(new OctahedronGeometry(0.2, 0), matInvisible)]],
      XY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]],
      YZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]]
    }

    const helperTranslate = {
      START: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
      END: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
      DELTA: [[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']],
      X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
      Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
      Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
    }

    const gizmoRotate = {
      XYZE: [[new Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]],
      X: [[new Mesh(CircleGeometry(0.5, 0.5), matRed)]],
      Y: [[new Mesh(CircleGeometry(0.5, 0.5), matGreen), null, [0, 0, -Math.PI / 2]]],
      Z: [[new Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]],
      E: [[new Mesh(CircleGeometry(0.75, 1), matYellowTransparent), null, [0, Math.PI / 2, 0]]]
    }

    const helperRotate = {
      AXIS: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']]
    }

    const pickerRotate = {
      XYZE: [[new Mesh(new SphereGeometry(0.25, 10, 8), matInvisible)]],
      X: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
      Y: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]]],
      Z: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]]],
      E: [[new Mesh(new TorusGeometry(0.75, 0.1, 2, 24), matInvisible)]]
    }

    const gizmoScale = {
      X: [
        [new Mesh(scaleHandleGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(scaleHandleGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(scaleHandleGeometry, matGreen), [0, 0.5, 0]],
        [new Mesh(lineGeometry2, matGreen)],
        [new Mesh(scaleHandleGeometry, matGreen), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new Mesh(lineGeometry2, matBlue), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent), [0.15, 0.15, 0]]],
      YZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]],
      XYZ: [[new Mesh(new BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent.clone())]]
    }

    const pickerScale = {
      X: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]],
      YZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]],
      XYZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 0]]]
    }

    const helperScale = {
      X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
      Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
      Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
    }

    // Creates an Object3D with gizmos described in custom hierarchy definition.

    function setupGizmo(gizmoMap) {
      const gizmo = new Object3D()

      for (const name in gizmoMap) {
        for (let i = gizmoMap[name].length; i--; ) {
          const object = gizmoMap[name][i][0].clone()
          const position = gizmoMap[name][i][1]
          const rotation = gizmoMap[name][i][2]
          const scale = gizmoMap[name][i][3]
          const tag = gizmoMap[name][i][4]

          // name and tag properties are essential for picking and updating logic.
          object.name = name
          object.tag = tag

          if (position) {
            object.position.set(position[0], position[1], position[2])
          }

          if (rotation) {
            object.rotation.set(rotation[0], rotation[1], rotation[2])
          }

          if (scale) {
            object.scale.set(scale[0], scale[1], scale[2])
          }

          object.updateMatrix()

          const tempGeometry = object.geometry.clone()
          tempGeometry.applyMatrix4(object.matrix)
          object.geometry = tempGeometry
          object.renderOrder = Infinity

          object.position.set(0, 0, 0)
          object.rotation.set(0, 0, 0)
          object.scale.set(1, 1, 1)

          gizmo.add(object)
        }
      }

      return gizmo
    }

    this.gizmo = {}
    this.picker = {}
    this.helper = {}
    this.add((this.gizmo[TransformMode.Translate] = setupGizmo(gizmoTranslate)))
    this.add((this.gizmo[TransformMode.Rotate] = setupGizmo(gizmoRotate)))
    this.add((this.gizmo[TransformMode.Scale] = setupGizmo(gizmoScale)))
    this.add((this.picker[TransformMode.Translate] = setupGizmo(pickerTranslate)))
    this.add((this.picker[TransformMode.Rotate] = setupGizmo(pickerRotate)))
    this.add((this.picker[TransformMode.Scale] = setupGizmo(pickerScale)))
    this.add((this.helper[TransformMode.Translate] = setupGizmo(helperTranslate)))
    this.add((this.helper[TransformMode.Rotate] = setupGizmo(helperRotate)))
    this.add((this.helper[TransformMode.Scale] = setupGizmo(helperScale)))
    const geometryScaleValue = 2
    const geometryScale = new Vector3(1, 1, 1).multiplyScalar(geometryScaleValue)
    for (const mode in this.gizmo) {
      this.gizmo[mode].scale.copy(geometryScale)
      this.helper[mode].scale.copy(geometryScale)
      this.picker[mode].scale.copy(geometryScale)
    }
    // Pickers should be hidden always

    this.picker[TransformMode.Translate].visible = false
    this.picker[TransformMode.Rotate].visible = false
    this.picker[TransformMode.Scale].visible = false
  }

  async load() {
    //gizmoGltf = await AssetLoader.loadAsync(GLTF_PATH, { ignoreDisposeGeometry: true })
    this.create()
    //this.model = gizmoGltf.scene
    //this.add(this.model)
    //this.selectionColor = new Color().setRGB(1, 1, 1)
    //this.previousColor = new Color()
    this.raycasterResults = []
    this.translateControls = this.gizmo[TransformMode.Translate]
    setObjectLayers(this, ObjectLayers.TransformGizmo)

    this.raycaster = new Raycaster()
    this.raycaster.layers.set(ObjectLayers.TransformGizmo)
    /*
    this.translateXAxis = this.translateControls.getObjectByName('X') as MeshWithAxisInfo
    
    this.translateXAxis.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.X,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateXAxis.material as MeshStandardMaterial
    }

    this.translateYAxis = this.translateControls.getObjectByName('Y') as MeshWithAxisInfo
    this.translateYAxis.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.Y,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.translateYAxis.material as MeshStandardMaterial
    }

    this.translateZAxis = this.translateControls.getObjectByName('Z') as MeshWithAxisInfo
    this.translateZAxis.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.Z,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateZAxis.material as MeshStandardMaterial
    }

    this.translateXYPlane = this.translateControls.getObjectByName('XY') as MeshWithAxisInfo
    this.translateXYPlane.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.XY,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.translateXYPlane.material as MeshStandardMaterial
    }

    this.translateYZPlane = this.translateControls.getObjectByName('YZ') as MeshWithAxisInfo
    this.translateYZPlane.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.YZ,
      planeNormal: new Vector3(1, 0, 0),
      selectionColorTarget: this.translateYZPlane.material as MeshStandardMaterial
    }

    this.translateXZPlane = this.translateControls.getObjectByName('XZ') as MeshWithAxisInfo
    this.translateXZPlane.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.XZ,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateXZPlane.material as MeshStandardMaterial
    }

    this.translateXYZ = this.translateControls.getObjectByName('XYZ') as MeshWithAxisInfo
    this.translateXYZ.axisInfo = {
      type: TransformAxisAction.Translate,
      axis: TransformAxis.XZ,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.translateXZPlane.material as MeshStandardMaterial
    }
    */
    this.rotateControls = this.gizmo[TransformMode.Rotate]
    /*
    this.rotateXAxis = this.rotateControls.getObjectByName('X')!
    const rotateXAxisDisk = this.rotateXAxis.getObjectByName('RotateXAxisDisk') as MeshWithAxisInfo
    const rotateXAxisStart = this.rotateXAxis.getObjectByName('RotateXAxisStart')!
    const rotateXAxisEnd = this.rotateXAxis.getObjectByName('RotateXAxisEnd')!

    const localRotateXAxisStart = rotateXAxisStart.clone()
    rotateXAxisDisk.axisInfo = {
      type: TransformAxisAction.Rotate,
      axis: TransformAxis.X,
      planeNormal: new Vector3(1, 0, 0),
      rotationTarget: rotateXAxisDisk,
      startMarker: rotateXAxisStart,
      startMarkerLocal: localRotateXAxisStart,
      endMarker: rotateXAxisEnd,
      selectionColorTarget: rotateXAxisDisk.material as MeshStandardMaterial
    }

    this.rotateYAxis = this.rotateControls.getObjectByName('Y')!
    const rotateYAxisDisk = this.rotateYAxis.getObjectByName('RotateYAxisDisk') as MeshWithAxisInfo
    const rotateYAxisStart = this.rotateYAxis.getObjectByName('RotateYAxisStart')!
    const rotateYAxisEnd = this.rotateYAxis.getObjectByName('RotateYAxisEnd')!

    const localRotateYAxisStart = rotateYAxisStart.clone()
    rotateYAxisDisk.axisInfo = {
      type: TransformAxisAction.Rotate,
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
      type: TransformAxisAction.Rotate,
      axis: TransformAxis.Z,
      planeNormal: new Vector3(0, 0, 1),
      rotationTarget: rotateZAxisDisk,
      startMarker: rotateZAxisStart,
      startMarkerLocal: localRotateZAxisStart,
      endMarker: rotateZAxisEnd,
      selectionColorTarget: rotateZAxisDisk.material as MeshStandardMaterial
    }
    */
    this.scaleControls = this.gizmo[TransformMode.Scale]
    /*
    this.scaleXAxis = this.scaleControls.getObjectByName('ScaleXAxis') as MeshWithAxisInfo
    this.scaleXAxis.axisInfo = {
      type: TransformAxisAction.Scale,
      axis: TransformAxis.X,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.scaleXAxis.material as MeshStandardMaterial
    }

    this.scaleYAxis = this.scaleControls.getObjectByName('ScaleYAxis') as MeshWithAxisInfo
    this.scaleYAxis.axisInfo = {
      type: TransformAxisAction.Scale,
      axis: TransformAxis.Y,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.scaleYAxis.material as MeshStandardMaterial
    }

    this.scaleZAxis = this.scaleControls.getObjectByName('ScaleZAxis') as MeshWithAxisInfo
    this.scaleZAxis.axisInfo = {
      type: TransformAxisAction.Scale,
      axis: TransformAxis.Z,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.scaleZAxis.material as MeshStandardMaterial
    }

    this.scaleXYPlane = this.scaleControls.getObjectByName('ScaleXYPlane') as MeshWithAxisInfo
    this.scaleXYPlane.axisInfo = {
      type: TransformAxisAction.Scale,
      axis: TransformAxis.XY,
      planeNormal: new Vector3(0, 0, 1),
      selectionColorTarget: this.scaleXYPlane.material as MeshStandardMaterial
    }

    this.scaleYZPlane = this.scaleControls.getObjectByName('ScaleYZPlane') as MeshWithAxisInfo
    this.scaleYZPlane.axisInfo = {
      type: TransformAxisAction.Scale,
      axis: TransformAxis.YZ,
      planeNormal: new Vector3(1, 0, 0),
      selectionColorTarget: this.scaleYZPlane.material as MeshStandardMaterial
    }

    this.scaleXZPlane = this.scaleControls.getObjectByName('ScaleXZPlane') as MeshWithAxisInfo
    this.scaleXZPlane.axisInfo = {
      type: TransformAxisAction.Scale,
      axis: TransformAxis.XZ,
      planeNormal: new Vector3(0, 1, 0),
      selectionColorTarget: this.scaleXZPlane.material as MeshStandardMaterial
    }

    this.scaleUniformHandle = this.scaleControls.getObjectByName('ScaleUniformHandle') as MeshWithAxisInfo
    this.scaleUniformHandle.axisInfo = {
      type: TransformAxisAction.Scale,
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
    */
    this.translateControls.visible = true
    this.rotateControls.visible = false
    this.scaleControls.visible = false

    if (!this.mode) this.mode = TransformMode.Disabled

    this.traverse((obj: Mesh<any, MeshBasicMaterial>) => {
      if (obj.isMesh) {
        obj.renderOrder = 100
      }
    })

    this.setTransformMode(this.mode)
  }

  get selectedAxis() {
    return this.selectedAxisObj?.axisInfo.axis
  }

  get selectedPlaneNormal() {
    return this.selectedAxisObj?.axisInfo.planeNormal
  }

  setTransformMode(mode: TransformModeType): void {
    this.mode = mode

    for (const mode in this.gizmo) {
      this.gizmo[mode].visible = false
      this.helper[mode].visible = false
    }

    switch (mode) {
      case TransformMode.Translate:
      //this.activeControls = [this.translateControls]
      case TransformMode.Rotate:
      //this.activeControls = [this.rotateControls]
      case TransformMode.Scale:
        //this.activeControls = [this.scaleControls]
        this.gizmo[mode].visible = true
        this.helper[mode].visible = true
        break
      case TransformMode.Combined:
        this.translateControls.visible = true
        this.rotateControls.visible = true
        this.scaleControls.visible = true
        //this.activeControls = [this.translateControls, this.rotateControls, this.scaleControls]
        break
      default:
        break
    }
  }

  setLocalScaleHandlesVisible(visible: boolean): void {
    /*this.scaleXAxis.visible = visible
    this.scaleYAxis.visible = visible
    this.scaleZAxis.visible = visible
    this.scaleXYPlane.visible = visible
    this.scaleYZPlane.visible = visible
    this.scaleXZPlane.visible = visible*/
  }

  raycastAxis(
    target: Vector2,
    camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  ): Intersection<Object3D> | undefined {
    if (this.activeControls?.length == 0) return

    this.raycasterResults.length = 0
    this.raycaster.setFromCamera(target, camera)

    return this.raycaster
      .intersectObjects(this.activeControls!, true, this.raycasterResults)
      .find((result) => (result.object as MeshWithAxisInfo).axisInfo !== undefined)
  }

  selectAxisWithRaycaster(
    target: Vector2,
    camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  ): TransformAxisType | undefined {
    this.deselectAxis()

    const axisResult = this.raycastAxis(target, camera)
    if (!axisResult) return

    this.selectedAxisObj = axisResult.object as MeshWithAxisInfo
    const newAxisInfo = this.selectedAxisObj.axisInfo

    this.previousColor.copy(newAxisInfo.selectionColorTarget.color)

    newAxisInfo.selectionColorTarget.color.copy(this.selectionColor)
    if (newAxisInfo.rotationStartObject) newAxisInfo.rotationStartObject.visible = true
    if (newAxisInfo.rotationEndObject) newAxisInfo.rotationEndObject.visible = true

    return newAxisInfo.axis
  }

  highlightHoveredAxis(target: Vector2, camera = getComponent(Engine.instance.cameraEntity, CameraComponent)): void {
    if (!this.activeControls) return
    if (this.hoveredAxis) this.hoveredAxis.axisInfo.selectionColorTarget.opacity = 0.5

    const axisResult = this.raycastAxis(target, camera)
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

  updateMatrixWorld(force) {
    //const space = ( this.mode === TransformMode.Scale ) ? TransformSpace.Local : this.space; // scale always oriented to local rotation

    //const quaternion = ( space === TransformSpace.Local ) ? this.worldQuaternion : _identityQuaternion;

    // Show only gizmos for current transform mode
    this.gizmo[TransformMode.Translate].visible = this.mode === TransformMode.Translate
    this.gizmo[TransformMode.Rotate].visible = this.mode === TransformMode.Rotate
    this.gizmo[TransformMode.Scale].visible = this.mode === TransformMode.Scale

    this.helper[TransformMode.Translate].visible = this.mode === TransformMode.Translate
    this.helper[TransformMode.Rotate].visible = this.mode === TransformMode.Rotate
    this.helper[TransformMode.Scale].visible = this.mode === TransformMode.Scale

    let handles: Mesh[] = []
    handles = handles.concat(this.picker[this.mode].children)
    handles = handles.concat(this.gizmo[this.mode].children)
    handles = handles.concat(this.helper[this.mode].children)

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i]

      // hide aligned to camera

      handle.visible = true
      handle.rotation.set(0, 0, 0)
      /*
			handle.position.copy( this.worldPosition ); //  make it copy the position of entity its attached to

			let factor;

			/*if ( this.camera.isOrthographicCamera ) {

				factor = ( this.camera.top - this.camera.bottom ) / this.camera.zoom; // put this in when we have an ortho camera

			} else {

			factor = this.worldPosition.distanceTo( this.cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );

			//}

			handle.scale.set( 1, 1, 1 ).multiplyScalar( factor * this.size / 4 );

			// TODO: simplify helpers and consider decoupling from gizmo

			if ( (handle as any).tag === 'helper' ) {

				handle.visible = false;

				if ( handle.name === 'AXIS' ) {

					handle.visible = !! this.axis;

					if ( this.axis === 'X' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, 0, 0 ) );
						handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

						if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) { // dissappear on parallel view angle

							handle.visible = false;

						}

					}

					if ( this.axis === 'Y' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, 0, Math.PI / 2 ) );
						handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

						if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

							handle.visible = false;

						}

					}

					if ( this.axis === 'Z' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, Math.PI / 2, 0 ) );
						handle.quaternion.copy( quaternion ).multiply( _tempQuaternion );

						if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {

							handle.visible = false;

						}

					}

					if ( this.axis === 'XYZE' ) {

						_tempQuaternion.setFromEuler( _tempEuler.set( 0, Math.PI / 2, 0 ) );
						_alignVector.copy( this.rotationAxis );
						handle.quaternion.setFromRotationMatrix( _lookAtMatrix.lookAt( _zeroVector, _alignVector, _unitY ) );
						handle.quaternion.multiply( _tempQuaternion );
						handle.visible = this.dragging;

					}

					if ( this.axis === 'E' ) {

						handle.visible = false;

					}


				} else if ( handle.name === 'START' ) {// for translate

					handle.position.copy( this.worldPositionStart );
					handle.visible = this.dragging;

				} else if ( handle.name === 'END' ) { // for translate 

					handle.position.copy( this.worldPosition );
					handle.visible = this.dragging;

				} else if ( handle.name === 'DELTA' ) { //for the line 

					handle.position.copy( this.worldPositionStart );
					handle.quaternion.copy( this.worldQuaternionStart );
					_tempVector.set( 1e-10, 1e-10, 1e-10 ).add( this.worldPositionStart ).sub( this.worldPosition ).multiplyScalar( - 1 );
					_tempVector.applyQuaternion( this.worldQuaternionStart.clone().invert() );
					handle.scale.copy( _tempVector );
					handle.visible = this.dragging;

				} else {

					handle.quaternion.copy( quaternion );

					if ( this.dragging ) {

						handle.position.copy( this.worldPositionStart );

					} else {

						handle.position.copy( this.worldPosition );

					}

					if ( this.axis ) {

						handle.visible = this.axis.search( handle.name ) !== - 1;

					}

				}

				// If updating helper, skip rest of the loop
				continue;

			}

			// Align handles to current local or world rotation

			handle.quaternion.copy( quaternion );

			if ( this.mode === 'translate' || this.mode === 'scale' ) {

				// Hide translate and scale axis facing the camera

				const AXIS_HIDE_THRESHOLD = 0.99;
				const PLANE_HIDE_THRESHOLD = 0.2;

				if ( handle.name === 'X' ) {

					if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'Y' ) {

					if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'Z' ) {

					if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'XY' ) {

					if ( Math.abs( _alignVector.copy( _unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'YZ' ) {

					if ( Math.abs( _alignVector.copy( _unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

				if ( handle.name === 'XZ' ) {

					if ( Math.abs( _alignVector.copy( _unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_THRESHOLD ) {

						handle.scale.set( 1e-10, 1e-10, 1e-10 );
						handle.visible = false;

					}

				}

			} else if ( this.mode === 'rotate' ) {

				// Align handles to current local or world rotation

				_tempQuaternion2.copy( quaternion );
				_alignVector.copy( this.eye ).applyQuaternion( _tempQuaternion.copy( quaternion ).invert() );

				if ( handle.name.search( 'E' ) !== - 1 ) {

					handle.quaternion.setFromRotationMatrix( _lookAtMatrix.lookAt( this.eye, _zeroVector, _unitY ) );

				}

				if ( handle.name === 'X' ) {

					_tempQuaternion.setFromAxisAngle( _unitX, Math.atan2( - _alignVector.y, _alignVector.z ) );
					_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );
					handle.quaternion.copy( _tempQuaternion );

				}

				if ( handle.name === 'Y' ) {

					_tempQuaternion.setFromAxisAngle( _unitY, Math.atan2( _alignVector.x, _alignVector.z ) );
					_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );
					handle.quaternion.copy( _tempQuaternion );

				}

				if ( handle.name === 'Z' ) {

					_tempQuaternion.setFromAxisAngle( _unitZ, Math.atan2( _alignVector.y, _alignVector.x ) );
					_tempQuaternion.multiplyQuaternions( _tempQuaternion2, _tempQuaternion );
					handle.quaternion.copy( _tempQuaternion );

				}

			}
      
			// Hide disabled axes
			handle.visible = handle.visible && ( handle.name.indexOf( 'X' ) === - 1 || this.showX );
			handle.visible = handle.visible && ( handle.name.indexOf( 'Y' ) === - 1 || this.showY );
			handle.visible = handle.visible && ( handle.name.indexOf( 'Z' ) === - 1 || this.showZ );
			handle.visible = handle.visible && ( handle.name.indexOf( 'E' ) === - 1 || ( this.showX && this.showY && this.showZ ) );
      */
      // highlight selected axis

      ;(handle.material as any)._color = (handle.material as any)._color || (handle.material as any).color.clone()
      ;(handle.material as any)._opacity = (handle.material as any)._opacity || (handle.material as any).opacity

      ;(handle.material as any).color.copy((handle.material as any)._color)
      ;(handle.material as any).opacity = (handle.material as any)._opacity

      if (this.axis) {
        if (handle.name === this.axis) {
          ;(handle.material as any).color.setHex(0xffff00)
          ;(handle.material as any).opacity = 1.0
        } else if (
          this.axis.split('').some(function (a) {
            return handle.name === a
          })
        ) {
          ;(handle.material as any).color.setHex(0xffff00)
          ;(handle.material as any).opacity = 1.0
        }
      }
    }

    super.updateMatrixWorld(force)
  }

  clone(): this {
    // You can only have one instance of TransformControls so return a dummy object when cloning.
    return new Object3D().copy(this) as this
  }
}
