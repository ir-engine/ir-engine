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

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { getMutableState, getState, startReactor } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'
import { DepthDataTexture } from './DepthDataTexture'
import { onSessionEnd } from './XRSessionFunctions'
import { ReferenceSpace, XRAction, XRState } from './XRState'

type SessionModes = 'inline' | 'immersive-ar' | 'immersive-vr' | 'none'
const SessionMode = {
  none: 'none' as SessionModes,
  inline: 'inline' as SessionModes,
  immersiveAR: 'immersive-ar' as SessionModes,
  immersiveVR: 'immersive-vr' as SessionModes
}

const XRStateDefaults = {
  sessionActive: false,
  requestingSession: false,
  scenePosition: new Vector3(),
  sceneRotation: new Quaternion(),
  sceneScale: 1,
  sceneScaleAutoMode: true,
  sceneScaleTarget: 1,
  sceneRotationOffset: 0,
  scenePlacementMode: 'unplaced' as 'unplaced' | 'placing' | 'placed',
  supportedSessionModes: {
    inline: false,
    'immersive-ar': false,
    'immersive-vr': false
  },
  avatarCameraMode: 'auto' as 'auto' | 'attached' | 'detached',
  unassingedInputSources: [] as XRInputSource[],
  session: null as XRSession | null,
  sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
  depthDataTexture: null as DepthDataTexture | null,
  is8thWallActive: false,
  viewerPose: null as XRViewerPose | null | undefined,
  userEyeHeight: 1.75,
  userHeightRatio: 1,
  xrFrame: null as XRFrame | null
}

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRAction', () => {
  describe('sessionChanged', () => {
    it('should initialize the .name field with the expected value', () => {
      expect(XRAction.sessionChanged.type).toBe('xre.xr.sessionChanged')
    })
  }) //:: XRAction.sessionChanged

  describe('vibrateController', () => {
    it('should initialize the .name field with the expected value', () => {
      expect(XRAction.vibrateController.type).toBe('xre.xr.vibrateController')
    })
  }) //:: XRAction.vibrateController
}) //:: XRAction

describe('XRState', () => {
  describe('Fields', () => {
    it('should initialize the .name field with the expected value', () => {
      expect(XRState.name).toBe('XRState')
    })
  }) //:: XRState Fields

  describe('initial', () => {
    it('should initialize the data with the expected values', () => {
      const result = XRState.initial()
      expect(result).deep.equal(XRStateDefaults)
    })
  }) //:: XRState.initial

  describe('worldScale.get', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return the world scale of XRState by multiplying XRState.sceneScale by XRState.userHeightRatio', () => {
      const SceneScale = 21
      const UserHeightRatio = 2
      const Expected = 42
      // Set the data as expected
      getMutableState(XRState).sceneScale.set(SceneScale)
      getMutableState(XRState).userHeightRatio.set(UserHeightRatio)
      // Sanity check before running
      const before = getState(XRState)
      expect(before.sceneScale).toBe(SceneScale)
      expect(before.userHeightRatio).toBe(UserHeightRatio)
      // Run and Check the result
      const result = XRState.worldScale
      expect(result).toBe(Expected)
    })
  }) //:: XRState.worldScale.get

  describe('isMovementControlsEnabled.get', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it("should return true if XRState.sessionMode is not 'immersive-ar' and XRState.sessionActive is true", () => {
      const Expected = true
      const Mode = SessionMode.inline
      // Sanity check before running
      const beforeState = getState(XRState)
      expect(beforeState.sessionActive).toBe(true)
      expect(beforeState.sessionMode).not.toBe(SessionMode.immersiveAR)
      expect(beforeState.sessionMode).toBe(Mode)
      // Run and Check the result
      const result = XRState.isMovementControlsEnabled
      expect(result).toBe(Expected)
    })

    it('should always return true when XRState.sessionActive is false', async () => {
      const Expected = true
      const Mode = SessionMode.none
      // Set the data as expected
      onSessionEnd()
      // Sanity check before running
      const beforeState = getState(XRState)
      expect(beforeState.sessionActive).toBe(false)
      expect(beforeState.sessionMode).not.toBe(SessionMode.immersiveAR)
      expect(beforeState.sessionMode).toBe(Mode)
      // Run and Check the result
      const result = XRState.isMovementControlsEnabled
      expect(result).toBe(Expected)
    })

    it("should return true if XRState.sceneScale is not 1, XRState.sessionMode is 'immersive-ar' and XRState.sessionActive is true", () => {
      const Expected = true
      const Mode = SessionMode.immersiveAR
      // Set the data as expected
      getMutableState(XRState).sessionMode.set(Mode)
      getMutableState(XRState).sceneScale.set(0.5)
      // Sanity check before running
      const beforeState = getState(XRState)
      expect(beforeState.sceneScale).not.toBe(1)
      expect(beforeState.sessionMode).toBe(Mode)
      expect(beforeState.sessionActive).toBe(true)
      // Run and Check the result
      const result = XRState.isMovementControlsEnabled
      expect(result).toBe(Expected)
    })

    it("should return false if XRState.sceneScale is 1, XRState.sessionMode is 'immersive-ar' and XRState.sessionActive is true", () => {
      const Expected = false
      const Mode = SessionMode.immersiveAR
      // Set the data as expected
      getMutableState(XRState).sessionMode.set(Mode)
      // Sanity check before running
      const beforeState = getState(XRState)
      expect(beforeState.sceneScale).toBe(1)
      expect(beforeState.sessionMode).toBe(Mode)
      expect(beforeState.sessionActive).toBe(true)
      // Run and Check the result
      const result = XRState.isMovementControlsEnabled
      expect(result).toBe(Expected)
    })
  }) //:: XRState.isMovementControlsEnabled.get

  describe('isCameraAttachedToAvatar.get', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return false when XRState.session is falsy', async () => {
      const Expected = false
      const PlacementMode = 'placing'
      // Set the data as expected
      onSessionEnd()
      // Sanity check before running
      expect(getState(XRState).session).toBeFalsy()
      expect(getState(XRState).scenePlacementMode).not.toBe(PlacementMode)
      // Run and Check the result
      const result = XRState.isCameraAttachedToAvatar
      expect(result).toBe(Expected)
    })

    it("should return false when XRState.scenePlacementMode is 'placing'", () => {
      const Expected = false
      const PlacementMode = 'placing'
      // Set the data as expected
      getMutableState(XRState).scenePlacementMode.set(PlacementMode)
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).toBe(PlacementMode)
      // Run and Check the result
      const result = XRState.isCameraAttachedToAvatar
      expect(result).toBe(Expected)
    })

    it("should return true when XRState.avatarCameraMode is 'auto' and XRState.sceneScale is 1", () => {
      const Expected = true
      const PlacementMode = 'placing'
      const AvatarMode = 'auto'
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe(PlacementMode)
      expect(getState(XRState).avatarCameraMode).toBe(AvatarMode)
      expect(getState(XRState).sceneScale).toBe(1)
      // Run and Check the result
      const result = XRState.isCameraAttachedToAvatar
      expect(result).toBe(Expected)
    })

    it("should return false when XRState.avatarCameraMode is 'auto' and XRState.sceneScale is not 1", () => {
      const Expected = false
      const PlacementMode = 'placing'
      const AvatarMode = 'auto'
      const Scale = 42
      // Set the data as expected
      getMutableState(XRState).sceneScale.set(Scale)
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe(PlacementMode)
      expect(getState(XRState).avatarCameraMode).toBe(AvatarMode)
      expect(getState(XRState).sceneScale).not.toBe(1)
      expect(getState(XRState).sceneScale).toBe(Scale)
      // Run and Check the result
      const result = XRState.isCameraAttachedToAvatar
      expect(result).toBe(Expected)
    })

    it("should return true when XRState.avatarCameraMode is 'attached'", () => {
      const Expected = true
      const PlacementMode = 'placing'
      const AvatarMode = 'attached'
      // Set the data as expected
      getMutableState(XRState).avatarCameraMode.set(AvatarMode)
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe(PlacementMode)
      expect(getState(XRState).avatarCameraMode).not.toBe('auto')
      expect(getState(XRState).avatarCameraMode).toBe(AvatarMode)
      // Run and Check the result
      const result = XRState.isCameraAttachedToAvatar
      expect(result).toBe(Expected)
    })

    it("should return false when XRState.avatarCameraMode is not 'attached'", () => {
      const Expected = false
      const PlacementMode = 'placing'
      const AvatarMode = 'detached'
      // Set the data as expected
      getMutableState(XRState).avatarCameraMode.set(AvatarMode)
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe(PlacementMode)
      expect(getState(XRState).avatarCameraMode).not.toBe('auto')
      expect(getState(XRState).avatarCameraMode).toBe(AvatarMode)
      // Run and Check the result
      const result = XRState.isCameraAttachedToAvatar
      expect(result).toBe(Expected)
    })
  }) //:: XRState.isCameraAttachedToAvatar.get

  describe('setTrackingSpace', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRState.userHeightRatio to 1 when XRState.xrFrame is falsy', () => {
      const Expected = 1
      const Initial = 42
      // Set the data as expected
      getMutableState(XRState).xrFrame.set(null) // undo the XRFrame mock init from mockEmulatedXREngine
      getMutableState(XRState).userHeightRatio.set(Initial)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeFalsy()
      expect(getState(XRState).userHeightRatio).toBe(Initial)
      expect(getState(XRState).userHeightRatio).not.toBe(Expected)
      // Run and Check the result
      XRState.setTrackingSpace()
      const result = getState(XRState).userHeightRatio
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRState.userHeightRatio to 1 when the xrFrame.getViewerPose(ReferenceSpace.localFloor!) is falsy', () => {
      const Expected = 1
      const Initial = 42
      const ViewerPose = undefined as XRViewerPose | undefined
      // Set the data as expected
      const getViewerPoseMock = (_referenceSpace: XRReferenceSpace): XRViewerPose | undefined => {
        return ViewerPose
      }
      const getViewerPoseSpy = vi.fn(getViewerPoseMock)
      getMutableState(XRState).xrFrame.merge({ getViewerPose: getViewerPoseSpy })
      getMutableState(XRState).userHeightRatio.set(Initial)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRState).userHeightRatio).toBe(Initial)
      expect(getState(XRState).userHeightRatio).not.toBe(Expected)
      const pose = getState(XRState).xrFrame?.getViewerPose(ReferenceSpace.localFloor!)
      expect(getViewerPoseSpy).toHaveBeenCalled()
      expect(pose).toBeFalsy()
      // Run and Check the result
      XRState.setTrackingSpace()
      const result = getState(XRState).userHeightRatio
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRState.userHeightRatio to xrFrame.getViewerPose(ReferenceSpace.localFloor!).transform.position.y divided by XRState.userEyeHeight', () => {
      const Initial = 42
      const PositionY = Initial
      const UserEyeHeight = 2
      const Expected = PositionY / UserEyeHeight
      const ViewerPose = { transform: { position: { y: PositionY } } } as XRViewerPose | undefined
      // Set the data as expected
      const getViewerPoseMock = (_referenceSpace: XRReferenceSpace): XRViewerPose | undefined => {
        return ViewerPose
      }
      const getViewerPoseSpy = vi.fn(getViewerPoseMock)
      getMutableState(XRState).xrFrame.merge({ getViewerPose: getViewerPoseSpy })
      getMutableState(XRState).userHeightRatio.set(Initial)
      getMutableState(XRState).userEyeHeight.set(UserEyeHeight)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRState).userHeightRatio).toBe(Initial)
      expect(getState(XRState).userHeightRatio).not.toBe(Expected)
      const pose = getState(XRState).xrFrame?.getViewerPose(ReferenceSpace.localFloor!)
      expect(getViewerPoseSpy).toHaveBeenCalled()
      expect(pose).toBeTruthy()
      // Run and Check the result
      XRState.setTrackingSpace()
      const result = getState(XRState).userHeightRatio
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: XRState.setTrackingSpace

  describe('useMovementControlsEnabled', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it("should return true if XRState.sessionMode is not 'immersive-ar' and XRState.sessionActive is true", () => {
      const Expected = true
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useMovementControlsEnabled()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useMovementControlsEnabled')
      // Sanity check before running
      expect(reactorSpy).not.toHaveBeenCalled()
      expect(getState(XRState).sessionMode).not.toBe('immersive-ar')
      expect(getState(XRState).sessionActive).toBe(true)
      expect(result).not.toBe(Expected)
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it('should always return true when XRState.sessionActive is false', () => {
      const Expected = true
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useMovementControlsEnabled()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useMovementControlsEnabled')
      getMutableState(XRState).sessionActive.set(false)
      // Sanity check before running
      expect(reactorSpy).not.toHaveBeenCalled()
      expect(getState(XRState).sessionMode).not.toBe('immersive-ar')
      expect(getState(XRState).sessionActive).not.toBe(true)
      expect(result).not.toBe(Expected)
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return true if XRState.sceneScale is not 1, XRState.sessionMode is 'immersive-ar' and XRState.sessionActive is true", () => {
      const Expected = true
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useMovementControlsEnabled()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useMovementControlsEnabled')
      getMutableState(XRState).sceneScale.set(0.5)
      getMutableState(XRState).sessionMode.set('immersive-ar')
      // Sanity check before running
      expect(reactorSpy).not.toHaveBeenCalled()
      expect(getState(XRState).sceneScale).not.toBe(1)
      expect(getState(XRState).sessionMode).toBe('immersive-ar')
      expect(getState(XRState).sessionActive).toBe(true)
      expect(result).not.toBe(Expected)
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return false if XRState.sceneScale is 1, XRState.sessionMode is 'immersive-ar' and XRState.sessionActive is true", () => {
      const Expected = false
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useMovementControlsEnabled()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useMovementControlsEnabled')
      getMutableState(XRState).sessionMode.set('immersive-ar')
      // Sanity check before running
      expect(reactorSpy).not.toHaveBeenCalled()
      expect(getState(XRState).sceneScale).toBe(1)
      expect(getState(XRState).sessionMode).toBe('immersive-ar')
      expect(getState(XRState).sessionActive).toBe(true)
      expect(result).not.toBe(Expected)
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })
  }) //:: XRState.useMovementControlsEnabled

  describe('useCameraAttachedToAvatar', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return false when XRState.session is falsy', async () => {
      const Expected = false
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useCameraAttachedToAvatar()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useCameraAttachedToAvatar')
      getMutableState(XRState).session.set(null)
      // Sanity check before running
      expect(getState(XRState).session).toBeFalsy()
      expect(reactorSpy).not.toHaveBeenCalled()
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return false when XRState.scenePlacementMode is 'placing'", () => {
      const Expected = false
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useCameraAttachedToAvatar()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useCameraAttachedToAvatar')
      getMutableState(XRState).scenePlacementMode.set('placing')
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).toBe('placing')
      expect(reactorSpy).not.toHaveBeenCalled()
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return true when XRState.avatarCameraMode is 'auto' and XRState.sceneScale is 1", () => {
      const Expected = true
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useCameraAttachedToAvatar()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useCameraAttachedToAvatar')
      getMutableState(XRState).avatarCameraMode.set('auto')
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe('placing')
      const earlyExit = !getState(XRState).session || getState(XRState).scenePlacementMode === 'placing'
      expect(earlyExit).toBeFalsy()
      expect(getState(XRState).avatarCameraMode).toBe('auto')
      expect(getState(XRState).sceneScale).toBe(1)
      expect(reactorSpy).not.toHaveBeenCalled()
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return false when XRState.avatarCameraMode is 'auto' and XRState.sceneScale is not 1", () => {
      const Expected = false
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useCameraAttachedToAvatar()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useCameraAttachedToAvatar')
      getMutableState(XRState).avatarCameraMode.set('auto')
      getMutableState(XRState).sceneScale.set(0.5)
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe('placing')
      const earlyExit = !getState(XRState).session || getState(XRState).scenePlacementMode === 'placing'
      expect(earlyExit).toBeFalsy()
      expect(getState(XRState).avatarCameraMode).toBe('auto')
      expect(getState(XRState).sceneScale).not.toBe(1)
      expect(reactorSpy).not.toHaveBeenCalled()
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return true when XRState.avatarCameraMode is 'attached'", () => {
      const Expected = true
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useCameraAttachedToAvatar()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useCameraAttachedToAvatar')
      getMutableState(XRState).avatarCameraMode.set('attached')
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe('placing')
      const earlyExit = !getState(XRState).session || getState(XRState).scenePlacementMode === 'placing'
      expect(earlyExit).toBeFalsy()
      expect(getState(XRState).avatarCameraMode).not.toBe('auto')
      expect(getState(XRState).avatarCameraMode).toBe('attached')
      expect(reactorSpy).not.toHaveBeenCalled()
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

    it("should return false when XRState.avatarCameraMode is not 'attached'", () => {
      const Expected = false
      // Set the data as expected
      let result: boolean = !Expected
      const Reactor = () => {
        result = XRState.useCameraAttachedToAvatar()
        return null
      }
      const reactorSpy = vi.spyOn(XRState, 'useCameraAttachedToAvatar')
      getMutableState(XRState).avatarCameraMode.set('detached')
      // Sanity check before running
      expect(getState(XRState).session).toBeTruthy()
      expect(getState(XRState).scenePlacementMode).not.toBe('placing')
      const earlyExit = !getState(XRState).session || getState(XRState).scenePlacementMode === 'placing'
      expect(earlyExit).toBeFalsy()
      expect(getState(XRState).avatarCameraMode).not.toBe('attached')
      expect(reactorSpy).not.toHaveBeenCalled()
      // Run and Check the result
      startReactor(Reactor)
      expect(reactorSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })
  }) //:: XRState.useCameraAttachedToAvatar
}) //:: XRState
