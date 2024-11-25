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

// @ts-nocheck
import EX_API from './api/index'
import XRHitTestResult from './api/XRHitTestResult'
import XRHitTestSource from './api/XRHitTestSource'
import XRTransientInputHitTestResult from './api/XRTransientInputHitTestResult'
import XRTransientInputHitTestSource from './api/XRTransientInputHitTestSource'
import EmulatedXRDevice from './EmulatedXRDevice'
import API from './webxr-polyfill/api/index'
import XRFrame from './webxr-polyfill/api/XRFrame'
import XRRigidTransform from './webxr-polyfill/api/XRRigidTransform'
import XRSession, { PRIVATE as XRSESSION_PRIVATE } from './webxr-polyfill/api/XRSession'
import XRSystem from './webxr-polyfill/api/XRSystem'
import { XR_COMPATIBLE } from './webxr-polyfill/constants'
import WebXRPolyfill from './webxr-polyfill/WebXRPolyfill'
import { WebXREventDispatcher } from './WebXREventDispatcher'

/**
 * Adapted from the mozilla webxr emulator
 * https://github.com/MozillaReality/WebXR-emulator-extension
 */

export class IREngineWebXRPolyfill extends WebXRPolyfill {
  constructor() {
    super({ global: globalThis })
    // Note: Experimental.
    //       Override some XR APIs to track active immersive session to
    //       enable to exit immersive by the extension.
    //       Exiting without user gesture in the page might violate security policy
    //       so there might be a chance that we remove this feature at some point.

    let activeImmersiveSession = null
    const originalRequestSession = XRSystem.prototype.requestSession
    XRSystem.prototype.requestSession = function (mode, enabledFeatures: any = {}) {
      return originalRequestSession.call(this, mode, enabledFeatures).then((session) => {
        if (mode === 'immersive-vr' || mode === 'immersive-ar') {
          activeImmersiveSession = session

          // DOM-Overlay API
          const optionalFeatures = enabledFeatures.optionalFeatures
          const domOverlay = enabledFeatures.domOverlay
          if (optionalFeatures && optionalFeatures.includes('dom-overlay') && domOverlay && domOverlay.root) {
            const device = session[XRSESSION_PRIVATE].device
            device.setDomOverlayRoot(domOverlay.root)
            session.domOverlayState = { type: 'screen' }
          }
        }
        return session
      })
    }

    const originalEnd = XRSession.prototype.end
    XRSession.prototype.end = function () {
      return originalEnd.call(this).then(() => {
        if (activeImmersiveSession === this) {
          activeImmersiveSession = null
        }
      })
    }

    WebXREventDispatcher.instance.addEventListener('webxr-exit-immersive', (event) => {
      if (activeImmersiveSession && !activeImmersiveSession.ended) {
        activeImmersiveSession.end().then(() => {
          activeImmersiveSession = null
        })
      }
    })

    // Extending XRSession and XRFrame for AR hitting test API.
    ;(XRSession.prototype as any).requestHitTestSource = function (options) {
      const source = new XRHitTestSource(this, options)
      const device = this[XRSESSION_PRIVATE].device
      device.addHitTestSource(source)
      return Promise.resolve(source)
    }
    ;(XRSession.prototype as any).requestHitTestSourceForTransientInput = function (options) {
      const source = new XRTransientInputHitTestSource(this, options)
      const device = this[XRSESSION_PRIVATE].device
      device.addHitTestSourceForTransientInput(source)
      return Promise.resolve(source)
    }
    ;(XRFrame.prototype as any).getHitTestResults = function (hitTestSource) {
      const device = this.session[XRSESSION_PRIVATE].device
      const hitTestResults = device.getHitTestResults(hitTestSource)
      const results = []
      for (const matrix of hitTestResults) {
        results.push(new XRHitTestResult(this, new XRRigidTransform(matrix)))
      }
      return results
    }
    ;(XRFrame.prototype as any).getHitTestResultsForTransientInput = function (hitTestSource) {
      const device = this.session[XRSESSION_PRIVATE].device
      const hitTestResults = device.getHitTestResultsForTransientInput(hitTestSource)
      if (hitTestResults.length === 0) {
        return []
      }
      const results = []
      for (const matrix of hitTestResults) {
        results.push(new XRHitTestResult(this, new XRRigidTransform(matrix)))
      }
      const inputSource = device.getInputSources()[0]
      return [new XRTransientInputHitTestResult(this, results, inputSource)]
    }

    if (this.nativeWebXR) {
      // Note: Even if native WebXR API is available the extension overrides
      //       it with WebXR polyfill because the extension doesn't work with
      //       the native one (yet).
      overrideAPI()
      this.injected = true
      this._patchNavigatorXR()
    } else {
      installEX_API()
      // Note: WebXR API polyfill can be overridden by native WebXR API on the latest Chrome 78
      //       after the extension is loaded but before loading page is completed
      //       if the native WebXR API is disabled via chrome://flags and the page includes
      //       WebXR origin trial.
      //       Here is a workaround. Check if XR class is native code when node is appended or
      //       the page is loaded. If it detects, override WebXR API with the polyfill.
      // @TODO: Remove this workaround if the major browser officially support native WebXR API
      let overridden = false
      const overrideIfNeeded = () => {
        if (overridden) {
          return false
        }
        if (isNativeFunction(this.global.XRSystem)) {
          overrideAPI()
          overridden = true
          return true
        }
        return false
      }
      const observer = new MutationObserver((list) => {
        for (const record of list) {
          for (const node of record.addedNodes) {
            if ((node as any).localName === 'script' && overrideIfNeeded()) {
              observer.disconnect()
              break
            }
          }
          if (overridden) {
            break
          }
        }
      })
      observer.observe(document, { subtree: true, childList: true })
      const onLoad = (event) => {
        if (!overridden) {
          observer.disconnect()
          overrideIfNeeded()
        }
        document.removeEventListener('DOMContentLoaded', onLoad)
      }
      document.addEventListener('DOMContentLoaded', onLoad)
    }
  }

  _patchNavigatorXR() {
    const devicePromise = requestXRDevice()
    this.xr = new XRSystem(devicePromise)
    Object.defineProperty(this.global.navigator, 'xr', {
      value: this.xr,
      configurable: true
    })
  }
}

const requestXRDevice = async () => {
  // resolve when receiving configuration parameters from content-script as an event
  return new Promise((resolve, reject) => {
    const callback = (event) => {
      WebXREventDispatcher.instance.removeEventListener('webxr-device-init', callback)
      resolve(
        new EmulatedXRDevice(
          globalThis,
          Object.assign({}, event.detail.deviceDefinition, { stereoEffect: event.detail.stereoEffect })
        )
      )
    }
    WebXREventDispatcher.instance.addEventListener('webxr-device-init', callback, false)
  })
}

// Easy native function detection.
const isNativeFunction = (func) => {
  return /\[native code\]/i.test(func.toString())
}

const overrideAPI = () => {
  console.log('WebXR emulator extension overrides native WebXR API with polyfill.')
  for (const className in API) {
    globalThis[className] = API[className]
  }
  installEX_API()

  // Since (desktop) Chrome 88 WebGL(2)RenderingContext.makeXRCompatible() seems
  // to start to reject if no immersive XR device is plugged in.
  // So we need to override them, too. Otherwise JS engines/apps including
  // "await context.makeXRCompatible();" won't work with the extension.
  // See https://github.com/MozillaReality/WebXR-emulator-extension/issues/266
  if (typeof WebGLRenderingContext !== 'undefined') {
    overrideMakeXRCompatible(WebGLRenderingContext)
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    overrideMakeXRCompatible(WebGL2RenderingContext)
  }
}

const installEX_API = () => {
  for (const className in EX_API) {
    globalThis[className] = EX_API[className]
  }
}

const overrideMakeXRCompatible = (Context) => {
  Context.prototype.makeXRCompatible = function () {
    this[XR_COMPATIBLE] = true
    // This is all fake, so just resolve immediately.
    return Promise.resolve()
  }
}
