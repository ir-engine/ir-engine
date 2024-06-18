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

import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry
} from 'three'

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

const GizmoMaterial = {
  INVISIBLE: 'matInvisible',
  HELPER: 'matHelper',
  RED: 'matRed',
  GREEN: 'matGreen',
  BLUE: 'matBlue',
  RED_TRANSPARENT: 'matRedTransparent',
  GREEN_TRANSPARENT: 'matGreenTransparent',
  BLUE_TRANSPARENT: 'matBlueTransparent',
  WHITE_TRANSPARENT: 'matWhiteTransparent',
  YELLOW_TRANSPARENT: 'matYellowTransparent',
  YELLOW: 'matYellow',
  GRAY: 'matGray'
}

const gizmoMaterialProperties = {
  [GizmoMaterial.INVISIBLE]: { color: 0xffffff, opacity: 0.15, visibility: 0.0 },
  [GizmoMaterial.HELPER]: { color: 0xffffff, opacity: 0.5, visibility: 1.0 },
  [GizmoMaterial.RED]: { color: 0xff0000, opacity: 1.0, visibility: 1.0 },
  [GizmoMaterial.GREEN]: { color: 0x00ff00, opacity: 1.0, visibility: 1.0 },
  [GizmoMaterial.BLUE]: { color: 0x0000ff, opacity: 1.0, visibility: 1.0 },
  [GizmoMaterial.RED_TRANSPARENT]: { color: 0xff0000, opacity: 0.5, visibility: 0.5 },
  [GizmoMaterial.GREEN_TRANSPARENT]: { color: 0x00ff00, opacity: 0.5, visibility: 0.5 },
  [GizmoMaterial.BLUE_TRANSPARENT]: { color: 0x0000ff, opacity: 0.5, visibility: 0.5 },
  [GizmoMaterial.WHITE_TRANSPARENT]: { color: 0xffffff, opacity: 0.25, visibility: 0.25 },
  [GizmoMaterial.YELLOW_TRANSPARENT]: { color: 0xffff00, opacity: 0.25, visibility: 0.25 },
  [GizmoMaterial.YELLOW]: { color: 0xffff00, opacity: 1.0, visibility: 1.0 },
  [GizmoMaterial.GRAY]: { color: 0x787878, opacity: 1.0, visibility: 1.0 }
}

const matInvisible = gizmoMaterial.clone()
matInvisible.opacity = gizmoMaterialProperties[GizmoMaterial.INVISIBLE].opacity
matInvisible.visible = false

const matHelper = gizmoLineMaterial.clone()
matHelper.opacity = gizmoMaterialProperties[GizmoMaterial.HELPER].opacity

const matRed = gizmoMaterial.clone()
matRed.color.setHex(gizmoMaterialProperties[GizmoMaterial.RED].color)

const matGreen = gizmoMaterial.clone()
matGreen.color.setHex(gizmoMaterialProperties[GizmoMaterial.GREEN].color)

const matBlue = gizmoMaterial.clone()
matBlue.color.setHex(gizmoMaterialProperties[GizmoMaterial.BLUE].color)

const matRedTransparent = gizmoMaterial.clone()
matRedTransparent.color.setHex(gizmoMaterialProperties[GizmoMaterial.RED_TRANSPARENT].color)
matRedTransparent.opacity = gizmoMaterialProperties[GizmoMaterial.RED_TRANSPARENT].opacity

const matGreenTransparent = gizmoMaterial.clone()
matGreenTransparent.color.setHex(gizmoMaterialProperties[GizmoMaterial.GREEN_TRANSPARENT].color)
matGreenTransparent.opacity = gizmoMaterialProperties[GizmoMaterial.GREEN_TRANSPARENT].opacity

const matBlueTransparent = gizmoMaterial.clone()
matBlueTransparent.color.setHex(gizmoMaterialProperties[GizmoMaterial.BLUE_TRANSPARENT].color)
matBlueTransparent.opacity = gizmoMaterialProperties[GizmoMaterial.BLUE_TRANSPARENT].opacity

const matWhiteTransparent = gizmoMaterial.clone()
matWhiteTransparent.opacity = gizmoMaterialProperties[GizmoMaterial.WHITE_TRANSPARENT].opacity

const matYellowTransparent = gizmoMaterial.clone()
matYellowTransparent.color.setHex(gizmoMaterialProperties[GizmoMaterial.YELLOW_TRANSPARENT].color)
matYellowTransparent.opacity = gizmoMaterialProperties[GizmoMaterial.YELLOW_TRANSPARENT].opacity

// const matYellow = gizmoMaterial.clone()
//matYellow.color.setHex(materialProperties[GizmoMaterial.YELLOW].color)

// we dont need mat yellow seperately

const matGray = gizmoMaterial.clone()
matGray.color.setHex(gizmoMaterialProperties[GizmoMaterial.GRAY].color)

// shader material implementation, presently broken

/*
const gizmoUniforms = UniformsUtils.merge([
  UniformsLib.common,  // Includes common uniforms like opacity and transparent
  {
    color: { value: new Color(0xffffff) }, // Default color white
    visibility: { value: 1.0 },            // Default visibility (1.0 means fully visible, 0.0 means invisible)
  }
]);

// Vertex shader
const vertexShader = `
  varying vec3 vColor;
  void main() {
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader
const fragmentShader = `
  uniform vec3 color;
  uniform float visibility;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(color * vColor, visibility);
  }
`;

// Create the shader material
const gizmoMaterialShader = new ShaderMaterial({
  name: 'GizmoMatShader',
  uniforms: gizmoUniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  depthTest: false,
  depthWrite: false,
  fog: false,
  toneMapped: false,
  transparent: true
});

// Function to update the material uniforms
export function setGizmoMaterialProperties(material, colorHex, opacity, visibility) {
  material.uniforms.color.value.setHex(colorHex);
  material.uniforms.visibility.value = visibility;
  material.opacity = opacity;
}

// Example materials


// Function to get material by name
export function getGizmoMaterial(name) {
  const props = materialProperties[name];
  const material = gizmoMaterialShader.clone()
  setGizmoMaterialProperties(material, props.color, props.opacity, props.visibility);
  return material;
}

export function setGizmoMaterial(material , name) {
  const props = materialProperties[name];
  setGizmoMaterialProperties(material, props.color, props.opacity, props.visibility);
  return material;
}

// Usage example


const matInvisible = getGizmoMaterial(GizmoMaterial.INVISIBLE);
const matHelper = getGizmoMaterial(GizmoMaterial.HELPER);
const matRed = getGizmoMaterial(GizmoMaterial.RED);
const matGreen = getGizmoMaterial(GizmoMaterial.GREEN);
const matBlue = getGizmoMaterial(GizmoMaterial.BLUE);
const matRedTransparent = getGizmoMaterial(GizmoMaterial.RED_TRANSPARENT);
const matGreenTransparent = getGizmoMaterial(GizmoMaterial.GREEN_TRANSPARENT);
const matBlueTransparent = getGizmoMaterial(GizmoMaterial.BLUE_TRANSPARENT);
const matWhiteTransparent = getGizmoMaterial(GizmoMaterial.WHITE_TRANSPARENT);
const matYellowTransparent = getGizmoMaterial(GizmoMaterial.YELLOW_TRANSPARENT);
const matYellow = getGizmoMaterial(GizmoMaterial.YELLOW);
const matGray = getGizmoMaterial(GizmoMaterial.GRAY);
*/

// reusable geometry

const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12).translate(0, 0.05, 0)
const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08).translate(0, 0.04, 0)
const lineGeometry = new BufferGeometry().setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))
const lineGeometry2 = new CylinderGeometry(0.0075, 0.0075, 0.5, 3).translate(0, 0.25, 0)

//plane geomerty
const gizmoPlane = new Mesh(
  new PlaneGeometry(100000, 100000, 2, 2),
  new MeshBasicMaterial({
    visible: false,
    wireframe: true,
    side: DoubleSide,
    transparent: true,
    opacity: 0.1,
    toneMapped: false
  })
)

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

// Creates an Object3D with gizmos described in custom hierarchy definition.

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
  XYZ: [[new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent), [0, 0, 0]]],
  XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent), [0.15, 0.15, 0]]],
  YZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
  XZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]]
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
  X: [[new Line(lineGeometry, matHelper), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
  Y: [[new Line(lineGeometry, matHelper), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
  Z: [[new Line(lineGeometry, matHelper), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
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
  XYZ: [[new Mesh(new BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent)]]
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
  X: [[new Line(lineGeometry, matHelper), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
  Y: [[new Line(lineGeometry, matHelper), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
  Z: [[new Line(lineGeometry, matHelper), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
}

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
      object.layers.set(ObjectLayers.TransformGizmo)
      object.position.set(0, 0, 0)
      object.rotation.set(0, 0, 0)
      object.scale.set(1, 1, 1)

      gizmo.add(object)
    }
  }

  return gizmo
}

export {
  gizmoTranslate,
  pickerTranslate,
  helperTranslate,
  gizmoRotate,
  pickerRotate,
  helperRotate,
  gizmoScale,
  pickerScale,
  helperScale,
  setupGizmo,
  GizmoMaterial,
  gizmoMaterialProperties,
  matInvisible,
  matHelper,
  matRed,
  matGreen,
  matBlue,
  matRedTransparent,
  matGreenTransparent,
  matBlueTransparent,
  matWhiteTransparent,
  matYellowTransparent,
  matGray,
  gizmoPlane
}
