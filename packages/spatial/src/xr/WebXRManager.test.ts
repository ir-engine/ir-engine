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

import assert from 'assert'
import { describe, it } from 'vitest'
import { XRRendererState } from './WebXRManager'

describe('XRRendererState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      assert.equal(XRRendererState.name, 'XRRendererState')
    })

    it('should initialize the *State.initial field with the expected value', () => {
      assert.deepEqual(XRRendererState.initial, {
        glBinding: null,
        glProjLayer: null,
        glBaseLayer: null,
        xrFrame: null,
        initialRenderTarget: null,
        newRenderTarget: null
      })
    })
  }) //:: Fields
}) //:: XRRendererState

describe('createWebXRManager', () => {
  // should set result.cameraAutoUpdate to false
  // should set result.enabled to false
  // should set result.useMultiview to true
  // should set result.isPresenting to false
  // should set result.isMultiview to false
  // TODO:
  // result.getSession : function () { ...
  // result.setSession = async function (session: XRSession, framebufferScaleFactor = 1) { ....
  // result.getEnvironmentBlendMode = function () { ....
  // result.updateCamera = function () {}
  // result.getCamera = function () { ....
  // result.getFoveation = function () { ....
  // result.setFoveation = function (foveation) { ....
  // result.setAnimationLoop = function () {}
  // result.dispose = function () {}
  // result.addEventListener = function (type: string, listener: EventListener) {}
  // result.hasEventListener = function (type: string, listener: EventListener) {}
  // result.removeEventListener = function (type: string, listener: EventListener) {}
  // result.dispatchEvent = function (event: Event) {}
}) //:: createWebXRManager
