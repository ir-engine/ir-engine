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
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill, XREmulatorHelper } from '../../tests/webxr/emulator'

import { ECSState, createEngine, destroyEngine, getComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import {
  ClampToEdgeWrapping,
  DepthFormat,
  DepthStencilFormat,
  LinearSRGBColorSpace,
  NearestFilter,
  RGBAFormat,
  Texture,
  UVMapping,
  UnsignedByteType,
  UnsignedInt248Type,
  UnsignedIntType,
  WebGLExtensions,
  WebGLProperties,
  WebGLRenderTarget,
  WebGLRenderer
} from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { CameraComponent } from '../camera/components/CameraComponent'
import { RendererComponent } from '../renderer/WebGLRendererSystem'
import { WebXRManager, WebXRManagerFunctions, XRRendererState, createWebXRManager } from './WebXRManager'
import { XRState } from './XRState'

const FunctionTypeName = 'function'
const VoidFunctionString = 'function() {\n  }'
const EventFunctionString = 'function(event) {\n  }'
const TypeListenerFunctionString = 'function(type, listener) {\n  }'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

function mockWebGLRenderer(): WebGLRenderer {
  return {
    properties: {
      get: (_: any): any => ({ __ignoreDepthValues: 0 })
    } as WebGLProperties,
    extensions: {
      has: (_name: string): boolean => true,
      get: (_name: string): any => ({})
    } as WebGLExtensions
  } as WebGLRenderer
}

function mockWebGLRenderingContext(): WebGLRenderingContext {
  return {
    getParameter(_pname: GLenum): any {}
  } as WebGLRenderingContext
}

describe('XRRendererState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      expect(XRRendererState.name).toBe('XRRendererState')
    })

    it('should initialize the *State.initial field with the expected value', () => {
      expect(XRRendererState.initial).deep.equal({
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

describe('WebXRManagerFunctions', () => {
  describe('getSession', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return XRState.session when called', () => {
      const Expected = getState(XRState).session
      // Run and Check the result
      const result = WebXRManagerFunctions.getSession()
      expect(result).toBe(Expected) // Check that the object returned is the exact same
      expect(result).toEqual(Expected) // Check that the object returned contains the same values in its fields (deepEqual)
    })
  }) //:: WebXRManagerFunctions.getSession

  describe('createFunctionOnSessionEnd', () => {
    let renderer: WebGLRenderer | null = null

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      renderer = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return a valid function', () => {
      // Sanity check before running
      assert(renderer)
      // Run and Check the result
      const result = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
      expect(() => result()).does.not.throw()
      expect(typeof result).toBe(FunctionTypeName)
    })

    describe('result', () => {
      it("should call XRState.session!.removeEventListener with 'end' as the first argument and itself as the second argument", () => {
        // Set the data as expected
        const resultSpy = vi.fn()
        getMutableState(XRState).session.merge({ removeEventListener: resultSpy })
        // Sanity check before running
        assert(renderer)
        // Run and Check the result
        const result = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        result()
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledWith('end', result)
      })

      it('should call renderer.setRenderTarget with XRRendererState.initialRenderTarget as an argument', () => {
        const Expected = getState(XRRendererState).initialRenderTarget
        // Set the data as expected
        const resultSpy = vi.fn()
        renderer!.setRenderTarget = resultSpy
        // Sanity check before running
        assert(renderer)
        // Run and Check the result
        const result = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        result()
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledWith(Expected)
      })

      it('should set XRRendererState.glBaseLayer to null', () => {
        const Expected = null
        // Set the data as expected
        assert(renderer)
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        // Sanity check before running
        const before = getState(XRRendererState).glBaseLayer
        expect(before).not.toBe(Expected)
        // Run and Check the result
        onSessionEnd()
        const result = getState(XRRendererState).glBaseLayer
        expect(result).toBe(Expected)
      })

      it('should set XRRendererState.glProjLayer to null', () => {
        const Expected = null
        const Initial = {} as XRProjectionLayer
        // Set the data as expected
        assert(renderer)
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        getMutableState(XRRendererState).glProjLayer.set(Initial)
        // Sanity check before running
        const before = getState(XRRendererState).glProjLayer
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        onSessionEnd()
        const result = getState(XRRendererState).glProjLayer
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('should set XRRendererState.glBinding to null', () => {
        const Expected = null
        const Initial = {} as XRWebGLBinding
        // Set the data as expected
        assert(renderer)
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        getMutableState(XRRendererState).glBinding.set(Initial)
        // Sanity check before running
        const before = getState(XRRendererState).glBinding
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        onSessionEnd()
        const result = getState(XRRendererState).glBinding
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('should set XRRendererState.newRenderTarget to null', () => {
        const Expected = null
        const Initial = {} as WebGLRenderTarget<Texture>
        // Set the data as expected
        assert(renderer)
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        getMutableState(XRRendererState).newRenderTarget.set(Initial)
        // Sanity check before running
        const before = getState(XRRendererState).newRenderTarget
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        onSessionEnd()
        const result = getState(XRRendererState).newRenderTarget
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('should call ECSState.timer.animation.setContext with globalThis as an argument', () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        getMutableState(ECSState).timer.animation.merge({ setContext: resultSpy })
        // Sanity check before running
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        onSessionEnd()
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledWith(globalThis)
      })

      it('should call ECSState.timer.animation.stop', () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        getMutableState(ECSState).timer.animation.merge({ stop: resultSpy })
        // Sanity check before running
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        onSessionEnd()
        expect(resultSpy).toHaveBeenCalled()
      })

      it('should call ECSState.timer.animation.start', () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, {} as WebXRManager)
        getMutableState(ECSState).timer.animation.merge({ start: resultSpy })
        // Sanity check before running
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        onSessionEnd()
        expect(resultSpy).toHaveBeenCalled()
      })

      it('should set manager.isPresenting to false', () => {
        const Expected = false
        const Initial = !Expected
        // Set the data as expected
        assert(renderer)
        const manager = {} as WebXRManager
        manager.isPresenting = Initial
        const onSessionEnd = WebXRManagerFunctions.createFunctionOnSessionEnd(renderer, manager)
        // Sanity check before running
        const before = manager.isPresenting
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        onSessionEnd()
        const result = manager.isPresenting
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })
    }) //:: result
  }) //:: WebXRManagerFunctions.createFunctionOnSessionEnd

  describe('createFunctionSetSession', () => {
    let renderer: WebGLRenderer | null = null

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      renderer = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return a valid function', () => {
      // Set the data as expected
      const manager = {
        onSessionEnd: () => {},
        setFoveation: (_) => {}
      } as WebXRManager
      // Sanity check before running
      assert(renderer)
      // Run and Check the result
      const result = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
      result(getState(XRState).session!)
      expect(() => result(getState(XRState).session!)).does.not.throw()
      expect(typeof result).toBe(FunctionTypeName)
    })

    describe('result', () => {
      it('should not do anything if `@param session` is null', async () => {
        const Initial = false
        // Set the data as expected
        getMutableState(XRState).session.set(null)
        assert(renderer)
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.isPresenting = Initial
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).toBe(null)
        const setSession = manager.setSession
        expect(() => setSession(getState(XRState).session!)).does.not.throw()
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(manager.isPresenting).toBe(Initial)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(manager.isPresenting).toBe(Initial)
      })

      it('should set `@param manager`.isPresenting to true', async () => {
        const Expected = true
        const Initial = !Expected
        // Set the data as expected
        assert(renderer)
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.isPresenting = Initial
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(manager.isPresenting).toBe(Initial)
        expect(manager.isPresenting).not.toBe(Expected)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(manager.isPresenting).not.toBe(Initial)
        expect(manager.isPresenting).toBe(Expected)
      })

      it('should set xrRendererState.initialRenderTarget to the value of `@param renderer`.getRenderTarget', async () => {
        const renderTarget = { width: 41, height: 42 } as WebGLRenderTarget<Texture>
        const Expected = renderTarget
        const Initial = undefined
        // Set the data as expected
        assert(renderer)
        renderer!.getRenderTarget = (): WebGLRenderTarget<Texture> | null => {
          return renderTarget
        }
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        const before = getMutableState(XRRendererState).initialRenderTarget.value
        expect(before).toBe(Initial)
        expect(before).not.toEqual(Expected)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        const result = getMutableState(XRRendererState).initialRenderTarget.value
        expect(result).not.toEqual(Initial)
        expect(result).toEqual(Expected)
      })

      it("should add an `'end'` event listener with the onSessionEnd function", async () => {
        // Set the data as expected
        assert(renderer)
        const addEventListenerSpy = vi.fn()
        getMutableState(XRState).session.merge({ addEventListener: addEventListenerSpy })
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(addEventListenerSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(addEventListenerSpy).toHaveBeenCalledOnce()
      })

      it('should call session.updateTargetFrameRate with a value of 72 if session.updateTargetFrameRate is a function', async () => {
        const Expected = 72
        // Set the data as expected
        assert(renderer)
        const updateTargetFrameRateSpy = vi.fn()
        getMutableState(XRState).session.merge({ updateTargetFrameRate: updateTargetFrameRateSpy })
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(updateTargetFrameRateSpy).not.toHaveBeenCalled()
        expect(typeof getState(XRState).session?.updateTargetFrameRate).toBe('function')
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(updateTargetFrameRateSpy).toHaveBeenCalledWith(Expected)
      })

      it('should call WebGLRenderingContext.makeXRCompatible when WebGLRenderingContext.getContextAttributes.xrCompatible is not true', async () => {
        // Set the data as expected
        assert(renderer)
        const makeXRCompatibleSpy = vi.fn()
        const glContext = renderer.getContext()
        glContext.makeXRCompatible = makeXRCompatibleSpy
        glContext.getContextAttributes = () => ({ xrCompatible: false })
        const glContextAttributes = glContext.getContextAttributes()
        glContextAttributes!.xrCompatible = false
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(makeXRCompatibleSpy).not.toHaveBeenCalled()
        expect(glContextAttributes?.xrCompatible).toBe(false)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(makeXRCompatibleSpy).toHaveBeenCalled()
      })

      it('should call WebXRManagerFunctions.createRenderTarget if `@param session`.renderState.layers is not undefined and `@param renderer`.capabilities.isWebGL2 is true', async () => {
        // Set the data as expected
        assert(renderer)
        Object.defineProperty(getState(XRState).session!, 'renderState', {
          value: { layers: [] as XRLayer[] | undefined } as XRRenderState,
          writable: false
        })
        renderer.properties = {
          get: (_: any): any => ({ __ignoreDepthValues: 0 })
        } as WebGLProperties
        const resultSpy = vi.spyOn(WebXRManagerFunctions, 'createRenderTarget')
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // Sanity check before running
        expect(getState(XRState).session?.renderState.layers).not.toBe(undefined)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      it('should call WebXRManagerFunctions.createRenderTargetLegacy if `@param session`.renderState.layers is undefined or renderer.capabilities.isWebGL2 is false', async () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.spyOn(WebXRManagerFunctions, 'createRenderTargetLegacy')
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // Sanity check before running
        expect(getState(XRState).session?.renderState.layers).toBe(undefined)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      it('should call WebXRManagerFunctions.createRenderTargetLegacy if `@param renderer`.capabilities.isWebGL2 is false', async () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.spyOn(WebXRManagerFunctions, 'createRenderTargetLegacy')
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // @ts-expect-error
        renderer.capabilities.isWebGL2 = false
        // Sanity check before running
        expect(getState(XRState).session?.renderState.layers).toBe(undefined)
        expect(renderer.capabilities.isWebGL2).toBe(false)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      it('should set XRRendererState.newRenderTarget to the newRenderTarget generated by the createRenderTarget process', async () => {
        const Initial = {} as WebGLRenderTarget
        // Set the data as expected
        assert(renderer)
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        getMutableState(XRRendererState).newRenderTarget.set(Initial)
        // Sanity check before running
        const before = getState(XRRendererState).newRenderTarget
        expect(before).toBe(Initial)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        const result = getState(XRRendererState).newRenderTarget
        expect(result).not.toBe(Initial)
      })

      it('should set newRenderTarget.isXRRenderTarget to true', async () => {
        const Expected = true
        const Initial = !Expected
        // Set the data as expected
        assert(renderer)
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        // @ts-expect-error The isXRRenderTarget property does not exist on the type, but it is created inside the function
        getMutableState(XRRendererState).newRenderTarget.merge({ isXRRenderTarget: Initial })
        // @ts-expect-error
        const before = getState(XRRendererState).newRenderTarget!.isXRRenderTarget
        expect(before).not.toBe(undefined)
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        // @ts-expect-error
        const result = getState(XRRendererState).newRenderTarget!.isXRRenderTarget
        expect(result).not.toBe(undefined)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('should call result.setFoveation with a value of 0', async () => {
        const Expected = 0
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setFoveation = resultSpy
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(resultSpy).toHaveBeenCalledOnce()
        expect(resultSpy).toHaveBeenCalledWith(Expected)
      })

      it('should call ECSState.timer.animation.setContext with the `@param session`', async () => {
        const Expected = getState(XRState).session
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        getMutableState(ECSState).timer.animation.merge({ setContext: resultSpy })
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        expect(resultSpy).toHaveBeenCalledOnce()
        expect(resultSpy).toHaveBeenCalledWith(Expected)
      })

      it('should call ECSState.timer.animation.stop', async () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        getMutableState(ECSState).timer.animation.merge({ stop: resultSpy })
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        await promise
        expect(promise).resolves.toEqual(undefined)
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      it('should call ECSState.timer.animation.start', async () => {
        // Set the data as expected
        assert(renderer)
        const resultSpy = vi.fn()
        getMutableState(ECSState).timer.animation.merge({ start: resultSpy })
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {}
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        const setSession = manager.setSession
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        expect(typeof setSession).toBe(FunctionTypeName)
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        await promise
        expect(promise).resolves.toEqual(undefined)
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      it('should set result.isPresenting to true', async () => {
        const Expected = true
        const Initial = !Expected
        // Set the data as expected
        assert(renderer)
        const manager = {
          onSessionEnd: () => {},
          setFoveation: (_) => {},
          isPresenting: Initial
        } as WebXRManager
        manager.setSession = WebXRManagerFunctions.createFunctionSetSession(renderer, manager)
        // Sanity check before running
        expect(getState(XRState).session).not.toBe(null)
        const setSession = manager.setSession
        expect(typeof setSession).toBe(FunctionTypeName)
        const before = manager.isPresenting
        expect(before).toBe(false)
        expect(before).not.toBe(true)
        // Run and Check the result
        const promise = setSession(getState(XRState).session!)
        expect(promise).resolves.toEqual(undefined)
        await promise
        const result = manager.isPresenting
        expect(result).not.toBe(false)
        expect(result).toBe(true)
      })
    }) //:: result
  }) //:: WebXRManagerFunctions.createFunctionSetSession

  describe('getEnvironmentBlendMode', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return XRState.session.environmentBlendMode when XRState.session is not null', () => {
      const Expected = getState(XRState).session?.environmentBlendMode
      // Sanity check before running
      expect(getState(XRState).session).not.toBe(null)
      // Run and Check the result
      const result = WebXRManagerFunctions.getEnvironmentBlendMode()
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })

    it('should return undefined when XRState.session is null', () => {
      const Expected = undefined
      // Set the data as expected
      if (getState(XRState).session !== null) getMutableState(XRState).session.set(null)
      // Sanity check before running
      expect(getState(XRState).session).toBe(null)
      // Run and Check the result
      const result = WebXRManagerFunctions.getEnvironmentBlendMode()
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })
  }) //:: WebXRManagerFunctions.getEnvironmentBlendMode

  describe('getCamera', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return the CameraComponent of ReferenceSpaceState.viewerEntity', () => {
      const Expected = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
      // Sanity check before running
      expect(() => WebXRManagerFunctions.getCamera()).does.not.throw()
      // Run and Check the result
      const result = WebXRManagerFunctions.getCamera()
      expect(result).toBe(Expected)
    })
  }) //:: WebXRManagerFunctions.getCamera

  describe('getFoveation', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return XRRendererState.glBaseLayer.fixedFoveation from XRRendererState.glBaseLayer when XRRendererState.glProjLayer is null and XRRendererState.glBaseLayer is not null', () => {
      const Expected = 42
      // Set the data as expected
      if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      // if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glBaseLayer.merge({ fixedFoveation: Expected })
      // Sanity check before running
      expect(getState(XRRendererState).glProjLayer).toBe(null)
      expect(getState(XRRendererState).glBaseLayer).not.toBe(null)
      // Run and Check the result
      const result = WebXRManagerFunctions.getFoveation()
      expect(result).not.toBe(undefined)
      expect(result).toBe(Expected)
    })

    it('should return XRRendererState.glProjLayer.fixedFoveation from XRRendererState.glProjLayer when XRRendererState.glProjLayer is not null', () => {
      const Expected = 42
      // Set the data as expected
      // if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      // if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glProjLayer.merge({ fixedFoveation: Expected })
      // Sanity check before running
      expect(getState(XRRendererState).glProjLayer).not.toBe(null)
      // expect(getState(XRRendererState).glBaseLayer).toBe(null)
      // Run and Check the result
      const result = WebXRManagerFunctions.getFoveation()
      expect(result).not.toBe(undefined)
      expect(result).toBe(Expected)
    })

    it('should return undefined when XRRendererState.glBaseLayer and XRRendererState.glProjLayer are both null', () => {
      const Expected = undefined
      // Set the data as expected
      if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      // Sanity check before running
      expect(getState(XRRendererState).glProjLayer).toBe(null)
      expect(getState(XRRendererState).glBaseLayer).toBe(null)
      // Run and Check the result
      const result = WebXRManagerFunctions.getFoveation()
      expect(result).toBe(Expected)
    })
  }) //:: WebXRManagerFunctions.getFoveation

  describe('setFoveation', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRRendererState.glProjLayer.fixedFoveation to `@param foveation` when XRRendererState.glProjLayer is not null', () => {
      const Expected = 42
      const Initial = 21
      // Set the data as expected
      // if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glProjLayer.merge({ fixedFoveation: Initial })
      // Sanity check before running
      expect(getState(XRRendererState).glProjLayer).not.toBe(null)
      expect(getState(XRRendererState).glBaseLayer).toBe(null)
      // Run and Check the result
      WebXRManagerFunctions.setFoveation(Expected)
      const result = getState(XRRendererState).glProjLayer?.fixedFoveation
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBaseLayer.fixedFoveation to `@param foveation` when XRRendererState.glBaseLayer is not null and XRRendererState.glBaseLayer.fixedFoveation it not undefined', () => {
      const Expected = 42
      const Initial = 21
      // Set the data as expected
      if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      // if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glBaseLayer.merge({ fixedFoveation: Initial })
      // Sanity check before running
      expect(getState(XRRendererState).glProjLayer).toBe(null)
      expect(getState(XRRendererState).glBaseLayer).not.toBe(null)
      // Run and Check the result
      WebXRManagerFunctions.setFoveation(Expected)
      const result = getState(XRRendererState).glBaseLayer?.fixedFoveation
      expect(result).toBe(Expected)
    })
  }) //:: WebXRManagerFunctions.setFoveation

  describe('createRenderTargetLegacy', () => {
    let glContext = {} as WebGLRenderingContext
    let framebufferScaleFactor = 1
    let glAttributes = {} as WebGLContextAttributes
    let renderer = {} as WebGLRenderer
    let manager = {} as WebXRManager

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      glContext = {} as WebGLRenderingContext
      framebufferScaleFactor = 1
      glAttributes = {} as WebGLContextAttributes
      renderer = {} as WebGLRenderer
      manager = {} as WebXRManager
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRRendererState.glBaseLayer to a new XRWebGLLayer', () => {
      const Initial = {} as XRWebGLLayer
      // Set the data as expected
      getMutableState(XRRendererState).glBaseLayer.set(Initial)
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = getState(XRRendererState).glBaseLayer
      expect(before).toBe(Initial)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = getState(XRRendererState).glBaseLayer
      expect(result).not.toBe(Initial)
    })

    it('should set XRRendererState.glBaseLayer.antialias to `@param attributes`.antialias when `@param session.renderState.layers` is === undefined', () => {
      const Expected = false
      const Initial = undefined
      // Set the data as expected
      glAttributes.antialias = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = getState(XRRendererState).glBaseLayer?.antialias
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = getState(XRRendererState).glBaseLayer?.antialias
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBaseLayer.antialias to true when `@param session.renderState.layers` is !== undefined', () => {
      const Expected = true
      const Initial = !Expected
      // Set the data as expected
      Object.defineProperty(getState(XRState).session!, 'renderState', {
        value: { layers: [] as XRLayer[] | undefined } as XRRenderState,
        writable: false
      })
      renderer.properties = {
        get: (_: any): any => ({ __ignoreDepthValues: 0 })
      } as WebGLProperties
      getMutableState(XRRendererState).glBaseLayer.set({ antialias: Initial } as XRWebGLLayer)
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).not.toBe(undefined)
      const before = getState(XRRendererState).glBaseLayer?.antialias
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = getState(XRRendererState).glBaseLayer?.antialias
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBaseLayer.config.alpha to `@param attributes`.alpha', () => {
      const Expected = false
      const Initial = undefined
      // Set the data as expected
      glAttributes.alpha = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = XREmulatorHelper.getXRWebGLLayerData(getState(XRRendererState).glBaseLayer).config.alpha
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = XREmulatorHelper.getXRWebGLLayerData(getState(XRRendererState).glBaseLayer).config.alpha
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBaseLayer.config.depth to `@param attributes`.depth', () => {
      const Expected = false
      const Initial = undefined
      // Set the data as expected
      glAttributes.depth = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = XREmulatorHelper.getXRWebGLLayerData(getState(XRRendererState).glBaseLayer).config.depth
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = XREmulatorHelper.getXRWebGLLayerData(getState(XRRendererState).glBaseLayer).config.depth
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBaseLayer.config.framebufferScaleFactor to `@param framebufferScaleFactor`', () => {
      const Expected = 42
      const Initial = 1.2
      // Set the data as expected
      framebufferScaleFactor = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = XREmulatorHelper.getXRWebGLLayerData(getState(XRRendererState).glBaseLayer).config
        .framebufferScaleFactor
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = XREmulatorHelper.getXRWebGLLayerData(getState(XRRendererState).glBaseLayer).config
        .framebufferScaleFactor
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should call session.updateRenderState with the newly created XRWebGLLayer as {baseLayer: glBaseLayer}', () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      getMutableState(XRState).session.merge({ updateRenderState: resultSpy })
      // Sanity check before running
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledWith({ baseLayer: getState(XRRendererState).glBaseLayer })
    })

    it('should set result.width to the newly created XRWebGLLayer.framebufferWidth', () => {
      const Expected = 1
      const Initial = undefined
      // Set the data as expected
      framebufferScaleFactor = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = getState(XRRendererState).glBaseLayer?.framebufferWidth
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).width
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set result.height to the newly created XRWebGLLayer.framebufferHeight', () => {
      const Expected = 1
      const Initial = undefined
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      const before = getState(XRRendererState).glBaseLayer?.framebufferHeight
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).height
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set result.texture.format to RGBAFormat', () => {
      const Expected = RGBAFormat
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).texture.format
      expect(result).toBe(Expected)
    })

    it('should set result.texture.type to UnsignedByteType', () => {
      const Expected = UnsignedByteType
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).texture.type
      expect(result).toBe(Expected)
    })

    it('should set result.texture.colorSpace to `@param renderer`.outputColorSpace', () => {
      const Expected = LinearSRGBColorSpace
      // Set the data as expected
      renderer.outputColorSpace = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).texture.colorSpace
      expect(result).toBe(Expected)
    })

    it('should set result.stencilBuffer to `@param attributes`.stencil', () => {
      const Expected = true
      // Set the data as expected
      glAttributes.stencil = Expected
      // Sanity check before running
      expect(getState(XRState).session?.renderState.layers).toBe(undefined)
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTargetLegacy(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).stencilBuffer
      expect(result).toBe(Expected)
    })
  }) //:: WebXRManagerFunctions.createRenderTargetLegacy

  describe('createRenderTarget', () => {
    let glContext = mockWebGLRenderingContext()
    let framebufferScaleFactor = 1
    let glAttributes = {} as WebGLContextAttributes
    let renderer = mockWebGLRenderer()
    let manager = {} as WebXRManager

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      glContext = mockWebGLRenderingContext()
      framebufferScaleFactor = 1
      glAttributes = {} as WebGLContextAttributes
      renderer = mockWebGLRenderer()
      manager = {} as WebXRManager
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it("should set `@param manager`.isMultiview to true if both manager.useMultiview and `@param renderer`.extensions.has('OCULUS_multiview') are true", () => {
      const Expected = true
      const Initial = !Expected
      // Set the data as expected
      manager.isMultiview = Initial
      manager.useMultiview = true
      glContext
      // Sanity check before running
      expect(manager.useMultiview).toBeTruthy()
      expect(renderer.extensions.has('OCULUS_multiview')).toBeTruthy()
      const before = manager.isMultiview
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = manager.isMultiview
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBinding to a new XRWebGLBinding instance', () => {
      const Initial = {} as XRWebGLBinding
      // Set the data as expected
      getMutableState(XRRendererState).glBinding.set(Initial)
      // Sanity check before running
      const before = getState(XRRendererState).glBinding
      expect(before).toBe(Initial)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      const result = getState(XRRendererState).glBinding
      expect(result).not.toBe(Initial)
    })

    describe('properties of XRRendererState.glProjLayer ..', () => {
      it('.. should set .colorFormat to the value of gl.RGBA8', () => {
        const Expected = 42
        const Initial = undefined
        // Set the data as expected
        glContext.RGBA8 = Expected
        // Sanity check before running
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.colorFormat
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.colorFormat
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('.. should set .depthFormat to gl.DEPTH24_STENCIL8 if `@param attributes`.stencil is truthy and `@param attributes`.depth is truthy', () => {
        const Expected = 42
        const Initial = undefined
        // Set the data as expected
        glAttributes.stencil = true
        glAttributes.depth = true
        glContext.DEPTH24_STENCIL8 = Expected
        // Sanity check before running
        expect(glAttributes.stencil).toBeTruthy()
        expect(glAttributes.depth).toBeTruthy()
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.depthFormat
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.depthFormat
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('.. should set .depthFormat to gl.DEPTH_COMPONENT24 if `@param attributes`.stencil is falsy and `@param attributes`.depth is truthy', () => {
        const Expected = 42
        const Initial = undefined
        // Set the data as expected
        glAttributes.depth = true
        glContext.DEPTH_COMPONENT24 = Expected
        // Sanity check before running
        expect(glAttributes.stencil).toBeFalsy()
        expect(glAttributes.depth).toBeTruthy()
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.depthFormat
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.depthFormat
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('.. should set .depthFormat to undefined if `@param attributes`.depth is falsy', () => {
        const Expected = undefined
        // Set the data as expected
        glAttributes.stencil = true
        // Sanity check before running
        expect(glAttributes.stencil).toBeTruthy()
        expect(glAttributes.depth).toBeFalsy()
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.depthFormat
        expect(result).toBe(Expected)
      })

      it('.. should set .scaleFactor to `@param framebufferScaleFactor`', () => {
        const Expected = 42
        const Initial = undefined
        // Set the data as expected
        framebufferScaleFactor = Expected
        // Sanity check before running
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.scaleFactor
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.scaleFactor
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it(".. should set .textureType to 'texture-array' if `@param manager`.useMultiview and renderer.extensions.has('OCULUS_multiview') are truthy", () => {
        const Expected = 'texture-array'
        const Initial = undefined
        // Set the data as expected
        manager.useMultiview = true
        // Sanity check before running
        expect(manager.useMultiview).toBeTruthy()
        expect(renderer.extensions.has('OCULUS_multiview')).toBeTruthy()
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.textureType
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.textureType
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it(".. should set .textureType to 'texture' if `@param manager`.useMultiview is falsy", () => {
        const Expected = 'texture'
        const Initial = undefined
        // Set the data as expected
        manager.useMultiview = false
        // Sanity check before running
        expect(manager.useMultiview).toBeFalsy()
        expect(renderer.extensions.has('OCULUS_multiview')).toBeTruthy()
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.textureType
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.textureType
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it(".. should set .textureType to 'texture' if renderer.extensions.has('OCULUS_multiview') is falsy", () => {
        const Expected = 'texture'
        const Initial = undefined
        // Set the data as expected
        manager.useMultiview = true
        renderer.extensions.has = (_) => false
        // Sanity check before running
        expect(manager.useMultiview).toBeTruthy()
        expect(renderer.extensions.has('OCULUS_multiview')).toBeFalsy()
        // @ts-expect-error
        const before = getState(XRRendererState).glProjLayer?.textureType
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        // @ts-expect-error
        const result = getState(XRRendererState).glProjLayer?.textureType
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it(".. should set .quality to 'graphics-optimized'", () => {
        const Expected = 'graphics-optimized'
        const Initial = undefined
        // Sanity check before running
        const before = getState(XRRendererState).glProjLayer?.quality
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        const result = getState(XRRendererState).glProjLayer?.quality
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })
    })

    it('should call `@param session`.updateRenderState with the newly assigned XRRendererState.glProjLayer', () => {
      const Initial = {} as XRProjectionLayer
      // Set the data as expected
      getMutableState(XRRendererState).glProjLayer.set(Initial)
      const resultSpy = vi.fn()
      getMutableState(XRState).session.merge({ updateRenderState: resultSpy })
      // Sanity check before running
      expect(resultSpy).not.toHaveBeenCalled()
      expect(getState(XRRendererState).glProjLayer).toBe(Initial)
      // Run and Check the result
      WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      )
      expect(getState(XRRendererState).glProjLayer).not.toBe(Initial)
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).not.toHaveBeenCalledWith(Initial)
    })

    it('should set result.texture.format to RGBAFormat', () => {
      const Expected = RGBAFormat
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).texture.format
      expect(result).toBe(Expected)
    })

    it('should set result.texture.type to UnsignedByteType', () => {
      const Expected = UnsignedByteType
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).texture.type
      expect(result).toBe(Expected)
    })

    it('should set result.width to glProjLayer.textureWidth', () => {
      const Expected = 42
      // @ts-expect-error
      global.XRWebGLBinding.prototype.createProjectionLayer = (_init?: XRProjectionLayerInit): XRProjectionLayer => {
        return { textureWidth: Expected } as XRProjectionLayer
      }
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).width
      expect(result).toBe(getState(XRRendererState).glProjLayer?.textureWidth)
    })

    it('should set result.height to glProjLayer.textureHeight', () => {
      const Expected = 42
      // @ts-expect-error
      global.XRWebGLBinding.prototype.createProjectionLayer = (_init?: XRProjectionLayerInit): XRProjectionLayer => {
        return { textureHeight: Expected } as XRProjectionLayer
      }
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).height
      expect(result).toBe(getState(XRRendererState).glProjLayer?.textureHeight)
    })

    it('should set result.options.depthTexture.type to UnsignedInt248Type if `@param attributes`.stencil is truthy and `@param attributes`.depth is truthy', () => {
      const Expected = UnsignedInt248Type
      // Set the data as expected
      glAttributes.stencil = true
      glAttributes.depth = true
      // Sanity check before running
      expect(glAttributes.stencil).toBeTruthy()
      expect(glAttributes.depth).toBeTruthy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.type
      expect(result).toBe(Expected)
    })

    it('should set result.options.depthTexture.type to UnsignedIntType if `@param attributes`.stencil is falsy and `@param attributes`.depth is truthy', () => {
      const Expected = UnsignedIntType
      // Set the data as expected
      glAttributes.stencil = false
      glAttributes.depth = true
      // Sanity check before running
      expect(glAttributes.stencil).toBeFalsy()
      expect(glAttributes.depth).toBeTruthy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.type
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.type to the default value (UnsignedIntType) if `@param attributes`.depth is falsy', () => {
      const Expected = UnsignedIntType
      // Set the data as expected
      glAttributes.stencil = true
      glAttributes.depth = undefined
      // Sanity check before running
      expect(glAttributes.stencil).toBeTruthy()
      expect(glAttributes.depth).toBeFalsy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.type
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.mapping to the default value (UVMapping)', () => {
      const Expected = UVMapping
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.mapping
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.wrapS to the default value (ClampToEdgeWrapping)', () => {
      const Expected = ClampToEdgeWrapping
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.wrapS
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.wrapT to the default value (ClampToEdgeWrapping)', () => {
      const Expected = ClampToEdgeWrapping
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.wrapT
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.magFilter to the default value (NearestFilter)', () => {
      const Expected = NearestFilter
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.magFilter
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.minFilter to the default value (NearestFilter)', () => {
      const Expected = NearestFilter
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.minFilter
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.anisotropy to the default value (1)', () => {
      const Expected = 1
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.anisotropy
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.format to DepthStencilFormat if `@param attributes`.stencil is truthy and `@param attributes`.depth is truthy', () => {
      const Expected = DepthStencilFormat
      // Set the data as expected
      glAttributes.stencil = true
      glAttributes.depth = true
      // Sanity check before running
      expect(glAttributes.stencil).toBeTruthy()
      expect(glAttributes.depth).toBeTruthy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.format
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.format to DepthFormat if `@param attributes`.stencil is falsy and `@param attributes`.depth is truthy', () => {
      const Expected = DepthFormat
      // Set the data as expected
      glAttributes.depth = true
      // Sanity check before running
      expect(glAttributes.stencil).toBeFalsy()
      expect(glAttributes.depth).toBeTruthy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.format
      expect(result).toBe(Expected)
    })

    it('should set result.depthTexture.format to the default value (DepthFormat) if `@param attributes`.depth is falsy', () => {
      const Expected = DepthFormat
      // Set the data as expected
      glAttributes.stencil = true
      // Sanity check before running
      expect(glAttributes.stencil).toBeTruthy()
      expect(glAttributes.depth).toBeFalsy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).depthTexture.format
      expect(result).toBe(Expected)
    })

    it('should set result.stencilBuffer to `@param attributes`.stencil', () => {
      const Expected = true
      // Set the data as expected
      glAttributes.stencil = Expected
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).stencilBuffer
      expect(result).toBe(Expected)
    })

    it('should set result.texture.colorSpace to `@param renderer`.outputColorSpace', () => {
      const Expected = LinearSRGBColorSpace
      // Set the data as expected
      renderer.outputColorSpace = Expected
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).texture.colorSpace
      expect(result).toBe(Expected)
    })

    it('should set result.samples to 4 if `@param attributes`.antialias is truthy', () => {
      const Expected = 4
      // Set the data as expected
      glAttributes.antialias = true
      // Sanity check before running
      expect(glAttributes.antialias).toBeTruthy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).samples
      expect(result).toBe(Expected)
    })

    it('should set result.texture.samples to 0 if `@param attributes`.antialias is falsy', () => {
      const Expected = 0
      // Sanity check before running
      expect(glAttributes.antialias).toBeFalsy()
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).samples
      expect(result).toBe(Expected)
    })

    it('should set `@param result`.width to XRRendererState.glProjLayer.textureWidth', () => {
      const Expected = 42
      // @ts-expect-error
      global.XRWebGLBinding.prototype.createProjectionLayer = (_init?: XRProjectionLayerInit): XRProjectionLayer => {
        return { textureWidth: Expected } as XRProjectionLayer
      }
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).width
      expect(result).toBe(getState(XRRendererState).glProjLayer?.textureWidth)
    })

    it('should set `@param result`.height to XRRendererState.glProjLayer.textureHeight', () => {
      const Expected = 42
      // @ts-expect-error
      global.XRWebGLBinding.prototype.createProjectionLayer = (_init?: XRProjectionLayerInit): XRProjectionLayer => {
        return { textureHeight: Expected } as XRProjectionLayer
      }
      // Run and Check the result
      const result = WebXRManagerFunctions.createRenderTarget(
        getState(XRState).session!,
        framebufferScaleFactor,
        glContext,
        glAttributes,
        renderer,
        manager
      ).height
      expect(result).toBe(getState(XRRendererState).glProjLayer?.textureHeight)
    })

    describe("when manager.useMultiview and `@param renderer`.extensions.has('OCULUS_multiview') are both true ..", () => {
      it(".. should set `@param manager`.maxNumViews to the result of gl.getParameter(renderer.extensions.get('OCULUS_multiview').MAX_VIEWS_OVR)", () => {
        const Expected = 42
        // Set the data as expected
        manager.useMultiview = true
        glContext.getParameter = (_) => Expected
        // Sanity check before running
        expect(manager.useMultiview).toBeTruthy()
        expect(renderer.extensions.has('OCULUS_multiview')).toBeTruthy()
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        const result = manager.maxNumViews
        expect(result).toBe(Expected)
      })

      it('.. should set `@param manager`.numViews to XRRendererState.glProjLayer.textureHeight', () => {
        const Expected = 42
        const Initial = 21
        // Set the data as expected
        manager.maxNumViews = Initial
        // @ts-expect-error
        global.XRWebGLBinding.prototype.createProjectionLayer = (_init?: XRProjectionLayerInit): XRProjectionLayer => {
          return { textureHeight: Expected } as XRProjectionLayer
        }
        // Sanity check before running
        const before = manager.maxNumViews
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // Run and Check the result
        WebXRManagerFunctions.createRenderTarget(
          getState(XRState).session!,
          framebufferScaleFactor,
          glContext,
          glAttributes,
          renderer,
          manager
        )
        const result = manager.maxNumViews
        expect(result).toBe(Initial)
        expect(result).not.toBe(Expected)
      })
    })
  }) //:: WebXRManagerFunctions.createRenderTarget
}) //:: WebXRManagerFunctions

describe('createWebXRManager', () => {
  let renderer: WebGLRenderer | null = null

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    renderer = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should set result.cameraAutoUpdate to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).cameraAutoUpdate
    expect(result).toBe(Expected)
  })

  it('should set result.enabled to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).enabled
    expect(result).toBe(Expected)
  })

  it('should set result.useMultiview to true', () => {
    const Expected = true
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).useMultiview
    expect(result).toBe(Expected)
  })

  it('should set result.isPresenting to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).isPresenting
    expect(result).toBe(Expected)
  })

  it('should set result.isMultiview to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).isMultiview
    expect(result).toBe(Expected)
  })

  it('should set result.getSession to a function that returns XRState.session when called', () => {
    const Expected = getState(XRState).session
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const resultFn = createWebXRManager(renderer).getSession
    const result = resultFn()
    expect(result).toBe(Expected) // Check that the object returned is the exact same
    expect(result).toEqual(Expected) // Check that the object returned contains the same values in its fields (deepEqual)
  })

  it('should set result.getEnvironmentBlendMode to the expected function', () => {
    const Expected = WebXRManagerFunctions.getEnvironmentBlendMode
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).getEnvironmentBlendMode
    expect(result).toBe(Expected)
  })

  it('should call createFunctionOnSessionEnd and set result.setSession to the resulting function', () => {
    // Set the data as expected
    const resultSpy = vi.spyOn(WebXRManagerFunctions, 'createFunctionOnSessionEnd')
    // Sanity check before running
    expect(resultSpy).not.toHaveBeenCalledOnce()
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).setSession
    result(getState(XRState).session!)
    expect(resultSpy).toHaveBeenCalledOnce()
  })

  it('should set result.updateCamera to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: VoidFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).updateCamera
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.getCamera to the expected function', () => {
    const Expected = WebXRManagerFunctions.getCamera
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).getCamera
    expect(result).toBe(Expected)
  })

  it('should set result.getFoveation to the expected function', () => {
    const Expected = WebXRManagerFunctions.getFoveation
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).getFoveation
    expect(result).toBe(Expected)
  })

  it('should set result.setFoveation to the expected function', () => {
    const Expected = WebXRManagerFunctions.setFoveation
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).setFoveation
    expect(result).toBe(Expected)
  })

  it('should set result.setAnimationLoop to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: VoidFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).setAnimationLoop
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.dispose to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: VoidFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).dispose
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.addEventListener to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: TypeListenerFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).addEventListener
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.hasEventListener to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: TypeListenerFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).hasEventListener
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.removeEventListener to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: TypeListenerFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).removeEventListener
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.dispatchEvent to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: EventFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).dispatchEvent
    expect(() => result({} as Event)).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })
}) //:: createWebXRManager
