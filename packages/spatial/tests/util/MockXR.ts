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

export class MockXRSpace {}

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
