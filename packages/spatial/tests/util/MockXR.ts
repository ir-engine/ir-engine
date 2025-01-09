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

import { MockEventListener } from './MockEventListener'

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

export class MockXRSpace extends EventTarget {}

export class MockXRReferenceSpace extends MockEventListener {
  getOffsetReferenceSpace = (originOffset: XRRigidTransform) => {
    return {}
  }

  onreset = () => {}
}

export class MockXRFrame {
  pose = new MockXRPose()
  getPose = (space, origin) => {
    return this.pose
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/XRFrame/getViewerPose
  getViewerPose(_referenceSpace: XRReferenceSpace): XRViewerPose | undefined {
    return {} as XRViewerPose
  }
}

export class MockXRPose {
  transform = {
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    orientation: {
      x: 0,
      y: 0,
      z: 0,
      w: 0
    }
  }
  // readonly linearVelocity?: DOMPointReadOnly | undefined;
  // readonly angularVelocity?: DOMPointReadOnly | undefined;
  // readonly emulatedPosition: boolean;
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
