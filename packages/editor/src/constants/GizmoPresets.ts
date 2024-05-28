import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry
} from 'three'

export const gizmoMaterial = new MeshBasicMaterial({
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

// reusable geometry

export const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12).translate(0, 0.05, 0)
export const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08).translate(0, 0.04, 0)
export const lineGeometry = new BufferGeometry().setAttribute(
  'position',
  new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3)
)
export const lineGeometry2 = new CylinderGeometry(0.0075, 0.0075, 0.5, 3).translate(0, 0.25, 0)

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

// Make unique material for each axis/color

export const matInvisible = gizmoMaterial.clone()
matInvisible.opacity = 0.15
matInvisible.visible = false

export const matHelper = gizmoLineMaterial.clone()
matHelper.opacity = 0.5

export const matRed = gizmoMaterial.clone()
matRed.color.setHex(0xff0000)

export const matGreen = gizmoMaterial.clone()
matGreen.color.setHex(0x00ff00)

export const matBlue = gizmoMaterial.clone()
matBlue.color.setHex(0x0000ff)

export const matRedTransparent = gizmoMaterial.clone()
matRedTransparent.color.setHex(0xff0000)
matRedTransparent.opacity = 0.5

export const matGreenTransparent = gizmoMaterial.clone()
matGreenTransparent.color.setHex(0x00ff00)
matGreenTransparent.opacity = 0.5

export const matBlueTransparent = gizmoMaterial.clone()
matBlueTransparent.color.setHex(0x0000ff)
matBlueTransparent.opacity = 0.5

export const matWhiteTransparent = gizmoMaterial.clone()
matWhiteTransparent.opacity = 0.25

export const matYellowTransparent = gizmoMaterial.clone()
matYellowTransparent.color.setHex(0xffff00)
matYellowTransparent.opacity = 0.25

export const matYellow = gizmoMaterial.clone()
matYellow.color.setHex(0xffff00)

export const matGray = gizmoMaterial.clone()
matGray.color.setHex(0x787878)

// Creates an Object3D with gizmos described in custom hierarchy definition.

// Gizmo definitions - custom hierarchy definitions for setupGizmo() function

export const gizmoTranslate = {
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
  YZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
  XZ: [
    [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
  ]
}

export const pickerTranslate = {
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

export const helperTranslate = {
  START: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
  END: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
  DELTA: [[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']],
  X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
  Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
  Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
}

export const gizmoRotate = {
  XYZE: [[new Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]],
  X: [[new Mesh(CircleGeometry(0.5, 0.5), matRed)]],
  Y: [[new Mesh(CircleGeometry(0.5, 0.5), matGreen), null, [0, 0, -Math.PI / 2]]],
  Z: [[new Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]],
  E: [[new Mesh(CircleGeometry(0.75, 1), matYellowTransparent), null, [0, Math.PI / 2, 0]]]
}

export const helperRotate = {
  AXIS: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']]
}

export const pickerRotate = {
  XYZE: [[new Mesh(new SphereGeometry(0.25, 10, 8), matInvisible)]],
  X: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
  Y: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]]],
  Z: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]]],
  E: [[new Mesh(new TorusGeometry(0.75, 0.1, 2, 24), matInvisible)]]
}

export const gizmoScale = {
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

export const pickerScale = {
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

export const helperScale = {
  X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
  Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
  Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
}

export function setupGizmo(gizmoMap) {
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
      object.layers.set(ObjectLayers.TransformGizmo)
      object.position.set(0, 0, 0)
      object.rotation.set(0, 0, 0)
      object.scale.set(1, 1, 1)

      gizmo.add(object)
    }
  }

  return gizmo
}

export const gizmoObject = {}
export const pickerObject = {}
export const helperObject = {}

gizmoObject[TransformMode.translate] = setupGizmo(gizmoTranslate)
gizmoObject[TransformMode.rotate] = setupGizmo(gizmoRotate)
gizmoObject[TransformMode.scale] = setupGizmo(gizmoScale)

pickerObject[TransformMode.translate] = setupGizmo(pickerTranslate)
pickerObject[TransformMode.rotate] = setupGizmo(pickerRotate)
pickerObject[TransformMode.scale] = setupGizmo(pickerScale)

helperObject[TransformMode.translate] = setupGizmo(helperTranslate)
helperObject[TransformMode.rotate] = setupGizmo(helperRotate)
helperObject[TransformMode.scale] = setupGizmo(helperScale)
