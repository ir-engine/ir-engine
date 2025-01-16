/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Matrix4, Quaternion, Vector3 } from 'three'

export class MockXRInputSource {
  handedness: XRHandedness
  targetRayMode: XRTargetRayMode
  targetRaySpace: XRSpace
  gripSpace?: XRSpace | undefined
  gamepad?: Gamepad | undefined
  profiles: string[]
  hand?: XRHand | undefined

  constructor(options: {
    handedness: XRHandedness
    targetRayMode: XRTargetRayMode
    targetRaySpace: XRSpace
    gripSpace?: XRSpace | undefined
    gamepad?: Gamepad | undefined
    profiles: string[]
    hand?: XRHand | undefined
  }) {
    for (const key in options) {
      this[key] = options[key]
    }
  }
}

export class MockXRSpace extends EventTarget {
  constructor(public matrix: Matrix4) {
    super()
  }
}

export class MockXRReferenceSpace extends MockXRSpace {
  getOffsetReferenceSpace = (originOffset: MockXRRigidTransform) => {
    const matrix = this.matrix.clone()
    const offsetMatrix = originOffset.matrix
    matrix.multiply(new Matrix4().fromArray(offsetMatrix))
    return new MockXRReferenceSpace(matrix)
  }

  onreset = () => {}

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {}

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) {}
}

const _scale = new Vector3()

export class MockXRFrame {
  pose = new MockXRPose() as any as XRPose

  getPose = (space: MockXRSpace, origin: MockXRSpace) => {
    const spacePose = new Matrix4().fromArray(space.matrix?.elements ?? (space as any)._baseMatrix)
    const originPose = new Matrix4().fromArray(origin.matrix?.elements ?? (origin as any)._baseMatrix)
    const position = new Vector3()
    const rotation = new Quaternion()
    const resultPose = new Matrix4()
    resultPose.multiplyMatrices(spacePose, originPose)
    resultPose.decompose(position, rotation, _scale)
    return new MockXRPose(position, rotation)
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/XRFrame/getViewerPose
  getViewerPose(space: MockXRReferenceSpace): XRViewerPose | undefined {
    const spacePose = new Matrix4().fromArray(space.matrix?.elements ?? (space as any)._baseMatrix)
    const position = new Vector3()
    const rotation = new Quaternion()
    spacePose.decompose(position, rotation, _scale)
    return new MockXRPose(position, rotation) as any as XRViewerPose
  }
}

export const MockXRPose = class {
  transform: MockXRRigidTransform
  constructor(position?: Vector3, orientation?: Quaternion) {
    this.transform = new MockXRRigidTransform(position, orientation)
  }
}

export class MockXRRigidTransform {
  position = new Vector3()
  orientation = new Quaternion()
  matrix = new Float32Array(16)

  constructor(position?: Vector3, orientation?: Quaternion) {
    if (position) this.position.copy(position)
    if (orientation) this.orientation.copy(orientation)
    this.matrix = new Float32Array(new Matrix4().compose(this.position, this.orientation, new Vector3()).toArray())
  }

  get inverse() {
    return new MockXRRigidTransform(
      this.position.clone().negate(),
      this.orientation.clone().invert()
    ) as unknown as XRRigidTransform
  }
}

//@ts-ignore
globalThis['XRRigidTransform'] = MockXRRigidTransform

export class MockXRPlane implements XRPlane {
  orientation: XRPlaneOrientation = 'horizontal'
  planeSpace: XRSpace = new MockXRSpace(new Matrix4())
  polygon: DOMPointReadOnly[] = []
  lastChangedTime: number = 0
}

export class MockXRMesh implements XRMesh {
  meshSpace: XRSpace = new MockXRSpace(new Matrix4())
  vertices: Float32Array = new Float32Array()
  indices: Uint32Array = new Uint32Array()
  lastChangedTime: number = 0
}

export class MockXRSession extends EventTarget {}
export class MockXRAnchor implements XRAnchor {
  anchorSpace: MockXRSpace
  delete(): void {}
  requestPersistentHandle?(): Promise<string>
}

export class MockXRWebGLBinding implements XRWebGLBinding {
  readonly nativeProjectionScaleFactor: number

  constructor(_session: XRSession, _context: WebGLRenderingContext) {}

  // @warning The process of this function is over-simplifed and only valid for mock testing.
  createProjectionLayer(init?: XRProjectionLayerInit): XRProjectionLayer {
    const result = {} as XRProjectionLayer
    if (init) for (const [key, value] of Object.entries(init)) result[key] = value
    return result
  }
  createQuadLayer(_init?: XRQuadLayerInit): XRQuadLayer {
    return {} as XRQuadLayer
  }
  createCylinderLayer(_init?: XRCylinderLayerInit): XRCylinderLayer {
    return {} as XRCylinderLayer
  }
  createEquirectLayer(_init?: XREquirectLayerInit): XREquirectLayer {
    return {} as XREquirectLayer
  }
  createCubeLayer(_init?: XRCubeLayerInit): XRCubeLayer {
    return {} as XRCubeLayer
  }
  getSubImage(_layer: XRCompositionLayer, _frame: XRFrame, _eye?: XREye): XRWebGLSubImage {
    return {} as XRWebGLSubImage
  }
  getViewSubImage(_layer: XRProjectionLayer, _view: XRView): XRWebGLSubImage {
    return {} as XRWebGLSubImage
  }
  getCameraImage(_camera: XRCamera): WebGLTexture {
    return {} as WebGLTexture
  }
}
// @ts-expect-error Allow declaring the XRWebGLBinding Mock into the global object as a polyfill
global.XRWebGLBinding = MockXRWebGLBinding
