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
import { afterEach, assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getIncomingAction, getLastAction } from '../../tests/util/actionHelpers'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import {
  CustomWebXRPolyfill,
  DeviceDefinitions,
  POLYFILL_ACTIONS,
  WebXREventDispatcher,
  XREmulatorHelper
} from '../../tests/webxr/emulator'

import { createEngine, destroyEngine, getComponent, getMutableComponent } from '@ir-engine/ecs'
import { applyIncomingActions, getMutableState, getState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { EngineState } from '../EngineState'
import { TransformComponent } from '../SpatialModule'
import { Q_IDENTITY, Vector3_One, Vector3_Zero } from '../common/constants/MathConstants'
import { destroySpatialEngine, destroySpatialViewer } from '../initializeEngine'
import { RendererComponent } from '../renderer/WebGLRendererSystem'
import {
  endXRSession,
  getReferenceSpaces,
  onSessionEnd,
  requestXRSession,
  setupXRSession,
  xrSessionChanged
} from './XRSessionFunctions'
import { ReferenceSpace, XRAction, XRState } from './XRState'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('onSessionEnd', () => {
  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should set XRState.sessionActive to false', async () => {
    const Expected = false
    const Initial = !Expected
    // Sanity check before running
    const before = getState(XRState).sessionActive
    expect(before).toBe(Initial)
    // Run and Check the result
    onSessionEnd()
    const result = getState(XRState).sessionActive
    expect(result).toBe(Expected)
  })

  it("should set XRState.sessionMode to 'none'", async () => {
    const Expected = 'none'
    const Initial = 'inline'
    // Sanity check before running
    const before = getState(XRState).sessionMode
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = getState(XRState).sessionMode
    expect(result).not.toBe(Initial)
    expect(result).toBe(Expected)
  })

  it('should set XRState.session to null', async () => {
    const Expected = null
    // Sanity check before running
    const before = getState(XRState).session
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = getState(XRState).session
    expect(result).toBe(Expected)
  })

  it('should set XRState.sceneScale to 1', async () => {
    const Expected = 1
    const Initial = 42
    // Set the data as expected
    getMutableState(XRState).sceneScale.set(Initial)
    // Sanity check before running
    const before = getState(XRState).sceneScale
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = getState(XRState).sceneScale
    expect(result).not.toBe(Initial)
    expect(result).toBe(Expected)
  })

  it('should set XRState.xrFrame to null', async () => {
    const Expected = null
    // Sanity check before running
    const before = getState(XRState).xrFrame
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = getState(XRState).xrFrame
    expect(result).toBe(Expected)
  })

  it("should set EngineState.viewerEntity.RendererComponent.renderer.domElement.style.display to ''", async () => {
    const Expected = ''
    // Sanity check before running
    const before = getComponent(getState(EngineState).viewerEntity, RendererComponent).renderer?.domElement.style
      .display
    expect(before).not.toBe(undefined)
    // Run and Check the result
    onSessionEnd()
    const result = getComponent(getState(EngineState).viewerEntity, RendererComponent).renderer?.domElement.style
      .display
    expect(result).toBe(Expected)
  })

  it('should set EngineState.viewerEntity.RendererComponent.needsResize to true', async () => {
    const Expected = true
    // Sanity check before running
    const before = getComponent(getState(EngineState).viewerEntity, RendererComponent).needsResize
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = getComponent(getState(EngineState).viewerEntity, RendererComponent).needsResize
    expect(result).toBe(Expected)
  })

  it('should set EngineState.originEntity.TransformComponent.position to Vector3_Zero', async () => {
    const Epsilon = 0.001
    const Expected = Vector3_Zero
    const Initial = new Vector3(41, 42, 43)
    // Set the data as expected
    const origin = getMutableComponent(getState(EngineState).originEntity, TransformComponent)
    origin.position.set(Initial)
    // Sanity check before running
    const before = origin.position.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = origin.position.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
  })

  it('should set EngineState.originEntity.TransformComponent.rotation to the identity Quaterion', async () => {
    const Epsilon = 0.001
    const Expected = Q_IDENTITY
    const Initial = new Quaternion(40, 41, 42, 43).normalize()
    // Set the data as expected
    const origin = getMutableComponent(getState(EngineState).originEntity, TransformComponent)
    origin.rotation.set(Initial)
    // Sanity check before running
    const before = origin.rotation.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    expect(before.w).to.be.approximately(Initial.w, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = origin.rotation.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
    expect(result.w).to.be.approximately(Expected.w, Epsilon)
  })

  it('should set EngineState.originEntity.TransformComponent.scale to Vector3_One', async () => {
    const Epsilon = 0.001
    const Expected = Vector3_One
    const Initial = new Vector3(41, 42, 43)
    // Set the data as expected
    const origin = getMutableComponent(getState(EngineState).originEntity, TransformComponent)
    origin.scale.set(Initial)
    // Sanity check before running
    const before = origin.scale.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = origin.scale.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
  })

  it('should set EngineState.localFloorEntity.TransformComponent.position to Vector3_Zero', async () => {
    const Epsilon = 0.001
    const Expected = Vector3_Zero
    const Initial = new Vector3(41, 42, 43)
    // Set the data as expected
    const localFloor = getMutableComponent(getState(EngineState).localFloorEntity, TransformComponent)
    localFloor.position.set(Initial)
    // Sanity check before running
    const before = localFloor.position.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = localFloor.position.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
  })

  it('should set EngineState.localFloorEntity.TransformComponent.rotation to the identity Quaterion', async () => {
    const Epsilon = 0.001
    const Expected = Q_IDENTITY
    const Initial = new Quaternion(40, 41, 42, 43).normalize()
    // Set the data as expected
    const localFloor = getMutableComponent(getState(EngineState).localFloorEntity, TransformComponent)
    localFloor.rotation.set(Initial)
    // Sanity check before running
    const before = localFloor.rotation.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    expect(before.w).to.be.approximately(Initial.w, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = localFloor.rotation.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
    expect(result.w).to.be.approximately(Expected.w, Epsilon)
  })

  it('should set EngineState.localFloorEntity.TransformComponent.scale to Vector3_One', async () => {
    const Epsilon = 0.001
    const Expected = Vector3_One
    const Initial = new Vector3(41, 42, 43)
    // Set the data as expected
    const localFloor = getMutableComponent(getState(EngineState).localFloorEntity, TransformComponent)
    localFloor.scale.set(Initial)
    // Sanity check before running
    const before = localFloor.scale.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = localFloor.scale.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
  })

  it('should set EngineState.viewerEntity.TransformComponent.scale to Vector3_One', async () => {
    const Epsilon = 0.001
    const Expected = Vector3_One
    const Initial = new Vector3(41, 42, 43)
    // Set the data as expected
    const viewer = getMutableComponent(getState(EngineState).viewerEntity, TransformComponent)
    viewer.scale.set(Initial)
    // Sanity check before running
    const before = viewer.scale.get()
    expect(before.x).to.be.approximately(Initial.x, Epsilon)
    expect(before.y).to.be.approximately(Initial.y, Epsilon)
    expect(before.z).to.be.approximately(Initial.z, Epsilon)
    // Run and Check the result
    onSessionEnd()
    const result = viewer.scale.get()
    expect(result.x).to.be.approximately(Expected.x, Epsilon)
    expect(result.y).to.be.approximately(Expected.y, Epsilon)
    expect(result.z).to.be.approximately(Expected.z, Epsilon)
  })

  it('should set ReferenceSpace.origin to null', async () => {
    const Expected = null
    // Sanity check before running
    const before = ReferenceSpace.origin
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = ReferenceSpace.origin
    expect(result).toBe(Expected)
  })

  it('should set ReferenceSpace.localFloor to null', async () => {
    const Expected = null
    // Sanity check before running
    const before = ReferenceSpace.localFloor
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = ReferenceSpace.localFloor
    expect(result).toBe(Expected)
  })

  it('should set ReferenceSpace.viewer to null', async () => {
    const Expected = null
    // Sanity check before running
    const before = ReferenceSpace.viewer
    expect(before).not.toBe(Expected)
    // Run and Check the result
    onSessionEnd()
    const result = ReferenceSpace.viewer
    expect(result).toBe(Expected)
  })

  it('should call `dispatchAction` with XRAction.sessionChanged{active:false}', () => {
    const Expected = false
    // Run and Check the result
    onSessionEnd()
    applyIncomingActions()
    // @ts-expect-error
    const result = getLastAction().active
    expect(result).toBe(Expected)
  })
}) //:: onSessionEnd

describe('getReferenceSpaces', () => {
  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it("should call `@param xrSession`.requestReferenceSpace with a value of `'local-floor'`", () => {
    const Expected = 'local-floor'
    // Setup the data as expected
    const xrSession = getMutableState(XRState).session.value as XRSession
    const requestReferenceSpaceSpy = vi.spyOn(xrSession, 'requestReferenceSpace')
    // Run and Check the result
    getReferenceSpaces(xrSession)
    expect(requestReferenceSpaceSpy).toHaveBeenCalled()
    expect(requestReferenceSpaceSpy).toHaveBeenCalledWith(Expected)
  })

  it("should call `@param xrSession`.requestReferenceSpace with a value of `'viewer'`", () => {
    const Expected = 'viewer'
    // Setup the data as expected
    const xrSession = getMutableState(XRState).session.value as XRSession
    const requestReferenceSpaceSpy = vi.spyOn(xrSession, 'requestReferenceSpace')
    // Run and Check the result
    getReferenceSpaces(xrSession)
    expect(requestReferenceSpaceSpy).toHaveBeenCalled()
    expect(requestReferenceSpaceSpy).toHaveBeenCalledWith(Expected)
  })
}) //:: getReferenceSpaces

describe('setupXRSession', () => {
  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    WebXREventDispatcher.instance.dispatchEvent({
      type: POLYFILL_ACTIONS.DEVICE_INIT,
      detail: { stereoEffect: false, deviceDefinition: DeviceDefinitions.Default }
    })
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should request a session by calling navigator.xr!.requestSession', async () => {
    // Set the data as expected
    const requestSessionSpy = vi.spyOn(navigator.xr!, 'requestSession')
    // Sanity check before running
    expect(requestSessionSpy).not.toHaveBeenCalled()
    // Run and Check the result
    await setupXRSession()
    expect(requestSessionSpy).toHaveBeenCalled()
  })

  it("should set XRSession.interactionMode to 'world-space' when navigator.userAgent.includes('OculusBrowser') is true", async () => {
    const Expected = 'world-space'
    // Set the data as expected
    const OculusString = 'OculusBrowser'
    const prev = navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: prev + OculusString, // Force the test userAgent to contain the desired string
      writable: false
    })
    // Sanity check before running
    expect(navigator.userAgent.includes(OculusString)).toBe(true)
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    const result = session.interactionMode
    expect(result).toBe(Expected)
  })

  it('should set XRState.sessionActive to true', async () => {
    const Expected = true
    // Sanity check before running
    expect(getState(XRState).sessionActive).not.toBe(Expected)
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    const result = getState(XRState).sessionActive
    expect(result).toBe(Expected)
  })

  it('should set XRState.sessionMode to `@param requestedMode` when it is passed', async () => {
    const Expected = 'inline'
    // Sanity check before running
    expect(getState(XRState).sessionMode).not.toBe(Expected)
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    const result = getState(XRState).sessionMode
    expect(result).toBe(Expected)
  })

  it(`should set XRState.sessionMode to 'immersive-ar'
      when XRState.supportedSessionModes['immersive-ar'] is true
      and @param requestedMode is not passed`, async () => {
    const Expected = 'immersive-ar'
    // Set the data as expected
    assert(getMutableState(XRState).value)
    expect(getState(XRState).supportedSessionModes).not.toBe(undefined)
    expect(getState(XRState).supportedSessionModes[Expected]).not.toBe(undefined)
    console.log(getState(XRState))
    console.log(getState(XRState).supportedSessionModes)
    getMutableState(XRState).supportedSessionModes.merge({ [Expected]: true })
    // Sanity check before running
    expect(getState(XRState).sessionMode).not.toBe(Expected)
    const supported = getState(XRState).supportedSessionModes[Expected]
    expect(supported).toBeTruthy()
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    const result = getState(XRState).sessionMode
    expect(result).toBe(Expected)
  })

  it(`should set XRState.sessionMode to 'immersive-vr'
      when XRState.supportedSessionModes['immersive-ar'] is false
      XRState.supportedSessionModes['immersive-vr'] is true
      and @param requestedMode is not passed`, async () => {
    const Expected = 'immersive-vr'
    // Set the data as expected
    assert(getMutableState(XRState).value)
    expect(getState(XRState).supportedSessionModes).not.toBe(undefined)
    expect(getState(XRState).supportedSessionModes[Expected]).not.toBe(undefined)
    getMutableState(XRState).supportedSessionModes.merge({ [Expected]: true })
    // Sanity check before running
    expect(getState(XRState).sessionMode).not.toBe(Expected)
    expect(getState(XRState).supportedSessionModes['immersive-ar']).toBe(false)
    expect(getState(XRState).supportedSessionModes['immersive-vr']).toBe(true)
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    const result = getState(XRState).sessionMode
    expect(result).toBe(Expected)
  })

  it(`should set XRState.sessionMode to 'inline'
      when XRState.supportedSessionModes['immersive-ar'] is false
      XRState.supportedSessionModes['immersive-vr'] is false
      and @param requestedMode is not passed`, async () => {
    const Expected = 'inline'
    // Set the data as expected
    assert(getMutableState(XRState).value)
    expect(getState(XRState).supportedSessionModes).not.toBe(undefined)
    expect(getState(XRState).supportedSessionModes[Expected]).not.toBe(undefined)
    getMutableState(XRState).supportedSessionModes[Expected].set(true)
    // Sanity check before running
    expect(getState(XRState).supportedSessionModes['immersive-ar']).toBe(false)
    expect(getState(XRState).supportedSessionModes['immersive-vr']).toBe(false)
    expect(getState(XRState).sessionMode).not.toBe(Expected)
    const supported = getState(XRState).supportedSessionModes[Expected]
    expect(supported).toBeTruthy()
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    const result = getState(XRState).sessionMode
    expect(result).toBe(Expected)
  })

  /**
  // @todo Only used by 8th wall
  it(`should call EngineState.viewerEntity.RendererComponent.xrManager.setSession
      with a framebufferScaleFactor of 0.5
      when xrSession.interactionMode is 'screen-space'
      and xrSession.domOverlayState?.type is 'screen'`, async () => {
    const Expected = 0.5
    // Set the data as expected
    const xrManager = getComponent(getState(EngineState).viewerEntity, RendererComponent).xrManager!
    const setSessionSpy = vi.spyOn(xrManager, 'setSession')
    // Run and Check the result
    expect(navigator.userAgent.includes('OculusBrowser')).toBe(true)
    const session = await setupXRSession()
    assert(session)
    expect(session.interactionMode).toBe('screen-space')
    expect(session.domOverlayState).toBe('screen')
    expect(setSessionSpy).toHaveBeenCalled()
    expect(setSessionSpy).toHaveBeenCalledWith(session, Expected)
  })
  */

  it(`should call EngineState.viewerEntity.RendererComponent.xrManager.setSession
      with a framebufferScaleFactor of 1.2
      when xrSession.interactionMode is not 'screen-space'
      and xrSession.domOverlayState?.type is not 'screen'`, async () => {
    const Expected = 1.2
    // Set the data as expected
    const xrManager = getComponent(getState(EngineState).viewerEntity, RendererComponent).xrManager!
    const setSessionSpy = vi.spyOn(xrManager, 'setSession')
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    expect(session.interactionMode).not.toBe('screen-space')
    expect(session.interactionMode).not.toBe('screen')
    expect(setSessionSpy).toHaveBeenCalledWith(session, Expected)
  })

  /**
  // @note Cannot be tested (currently). The WebXR emulator has special behavior
  it("should set EngineState.viewerEntity.RendererComponent.renderer!.domElement.style.display to 'none' when (typeof xrSession.visibilityState) is 'string'", async () => {
    const Expected = 'none'
    // Sanity check before running
    const before = getComponent(getState(EngineState).viewerEntity, RendererComponent).renderer!.domElement.style.display
    expect(before).not.toBe(Expected)
    // Run and Check the result
    const session = await setupXRSession()
    assert(session)
    expect(typeof session.visibilityState).toBe('string')
    const result = getComponent(getState(EngineState).viewerEntity, RendererComponent).renderer!.domElement.style.display
    expect(result).toBe(Expected)
  })
  */

  it('should return the newly requested session', async () => {
    const result = await setupXRSession()
    assert(result)
    expect(typeof result).toBe('object')
  })
}) //:: setupXRSession

describe('requestXRSession', () => {
  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    WebXREventDispatcher.instance.dispatchEvent({
      type: POLYFILL_ACTIONS.DEVICE_INIT,
      detail: { stereoEffect: false, deviceDefininion: DeviceDefinitions.Default }
    })
  })

  afterEach(async () => {
    await endXRSession()
    destroySpatialViewer()
    destroySpatialEngine()
    destroyEngine()
  })

  it('should be able to request a session without failing', async () => {
    const result = vi.fn(requestXRSession)
    await result()
    expect(result).toHaveResolved()
  })

  it('should call `setupXRSession` with `@param mode` as its argument', async () => {
    const Expected = 'inline'
    // Run and Check the result
    await requestXRSession({ mode: Expected })
    const result = XREmulatorHelper.getLastXRSessionData(getState(XRState).session).mode
    expect(result).toBe(Expected)
  })

  it('should not do anything if XRState.sessionActive is truthy', async () => {
    const Expected = null
    // Set the data as expected
    const xrState = getMutableState(XRState)
    xrState.sessionActive.set(true)
    // xrState.requestingSession.set(true)
    // Sanity check before running
    expect(xrState.sessionActive.value).toBeTruthy()
    expect(xrState.requestingSession.value).toBeFalsy()
    // Run and Check the result
    await requestXRSession()
    const result = getState(XRState).session
    expect(result).toBe(Expected)
  })

  it('should not do anything if XRState.requestingSession is truthy', async () => {
    const Expected = null
    // Set the data as expected
    const xrState = getMutableState(XRState)
    // xrState.sessionActive.set(true)
    xrState.requestingSession.set(true)
    // Sanity check before running
    expect(xrState.sessionActive.value).toBeFalsy()
    expect(xrState.requestingSession.value).toBeTruthy()
    // Run and Check the result
    await requestXRSession()
    const result = getState(XRState).session
    expect(result).toBe(Expected)
  })

  it('should not do anything if both XRState.requestingSession and XRState.sessionActive are truthy', async () => {
    const Expected = null
    // Set the data as expected
    const xrState = getMutableState(XRState)
    xrState.sessionActive.set(true)
    xrState.requestingSession.set(true)
    // Sanity check before running
    expect(xrState.sessionActive.value).toBeTruthy()
    expect(xrState.requestingSession.value).toBeTruthy()
    // Run and Check the result
    await requestXRSession()
    const result = getState(XRState).session
    expect(result).toBe(Expected)
  })

  it('should call `dispatchAction` with XRAction.sessionChanged', async () => {
    // Sanity check before running
    const before = getIncomingAction(XRAction.sessionChanged.type)
    expect(before).toBe(undefined)
    // Run and Check the result
    await requestXRSession()
    const result = getIncomingAction(XRAction.sessionChanged.type)
    assert(result)
    expect(typeof result).toBe('object')
  })

  /*
  // @note Cannot be tested. The EventTarget symbol from webxr-polyfill is not exported
  it("should add an `end` event listener to the resulting XRSession", async () => {
    // Run and Check the result
    await requestXRSession()
    expect(getState(XRState).session).not.toBe(undefined)
    for (const entry of Object.entries(getState(XRState).session!)){
      console.log(entry)
    }
    console.log(getState(XRState).session)
    // const result = getXRSessionEventTargetData(getState(XRState).session)
    // console.log(result)
  })
  */

  // @note Cannot be tested. The session created inside the hooked function is never returned. So a vi.spyOn will never trigger.
  // it("should call `getReferenceSpaces` on the newly created XRSession", async () => {})
}) //:: requestXRSession

describe('endXRSession', () => {
  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should end the XRState.session, marking it as null', async () => {
    const Initial = false
    const Expected = !Initial
    // Sanity check before running
    const before = getState(XRState).session
    expect(before).not.toBe(undefined)
    expect(before).not.toBe(null)
    expect(XREmulatorHelper.getLastXRSessionData(before).ended).toBe(Initial)
    // Run and Check the result
    await endXRSession()
    const result = getState(XRState).session
    expect(result).not.toBe(undefined)
    expect(result).not.toBe(null)
    expect(XREmulatorHelper.getLastXRSessionData(result).ended).toBe(Expected)
  })
}) //:: endXRSession

describe('xrSessionChanged', () => {
  it('does nothing, but does not fail to run either', () => {
    const Expected = undefined
    // @ts-ignore Allow coercing undefined into the function parameter
    const result = xrSessionChanged(undefined)
    expect(result).toBe(Expected)
  })
}) //:: xrSessionChanged
