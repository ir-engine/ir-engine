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
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { MockXRAnchor, MockXRFrame } from '../../tests/util/MockXR'
import { XRAnchorFunctions, XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'
import { ReferenceSpace, XRState } from './XRState'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRAnchorFunctions', () => {
  describe('createAnchor', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should call `@param xrFrame`.createAnchor and return its result if both `@param xrFrame` and ReferenceSpace.origin are truthy', async () => {
      const Expected = new MockXRAnchor()
      // Set the data as expected
      Expected.delete = vi.fn()
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Expected as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
      createAnchorSpy({} as XRRigidTransform, {} as XRSpace)
      Expected.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(1)
      expect(Expected.delete).toHaveBeenCalledTimes(1)
      // Run and Check the result
      let result: XRAnchor | undefined
      try {
        result = await XRAnchorFunctions.createAnchor(xrFrame, new Vector3(), new Quaternion())
      } catch (error) {
        expect(true).eq(false, "XRAnchorFunctions.createAnchor shouldn't throw an error under the defined conditions.")
      }
      expect(result).toBeTruthy()
      expect(result?.delete).toBe(Expected.delete)
      result?.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(2)
      expect(Expected.delete).toHaveBeenCalledTimes(2)
    })

    it('should throw an error if either of `@param xrFrame` and ReferenceSpace.origin is falsy', async () => {
      const Expected = new MockXRAnchor()
      // Set the data as expected
      Expected.delete = vi.fn()
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Expected as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      ReferenceSpace.origin = null
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).not.toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
      // Run and Check the result
      try {
        await XRAnchorFunctions.createAnchor(xrFrame, new Vector3(), new Quaternion())
      } catch (error) {
        expect(error.message).toMatch('XRFrame not available.')
      }
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
    })
  }) //:: createAnchor

  describe('createPersistentAnchor', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should call `@param xrFrame`.createAnchor and return its result inside slot 0 of the returned tuple if both `@param xrFrame` and ReferenceSpace.origin are truthy', async () => {
      const Expected = new MockXRAnchor()
      // Set the data as expected
      Expected.delete = vi.fn()
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Expected as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
      createAnchorSpy({} as XRRigidTransform, {} as XRSpace)
      Expected.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(1)
      expect(Expected.delete).toHaveBeenCalledTimes(1)
      // Run the process
      let resultTuple: [XRAnchor, string | undefined] | undefined = undefined
      try {
        resultTuple = await XRAnchorFunctions.createPersistentAnchor(xrFrame, new Vector3(), new Quaternion())
      } catch (error) {
        expect(true).eq(
          false,
          "XRAnchorFunctions.createPersistentAnchor shouldn't throw an error under the defined conditions."
        )
      }
      // Check the result
      assert(resultTuple)
      expect(typeof resultTuple[0]).not.toBe('string') // The XRAnchor is at result[0]
      const result = resultTuple[0] as XRAnchor
      expect(result).toBeTruthy()
      expect(result?.delete).toBe(Expected.delete)
      result?.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(2)
      expect(Expected.delete).toHaveBeenCalledTimes(2)
    })

    it('should call anchor.requestPersistentHandle and return its result inside slot 1 of the returned tuple if both `@param xrFrame` and ReferenceSpace.origin are truthy', async () => {
      const Expected = 'arstarst'
      const requestPersistentHandle_ShouldError = false
      // Set the data as expected
      const Anchor = new MockXRAnchor()
      Anchor.delete = vi.fn()
      Anchor['requestPersistentHandle'] = vi.fn(() => {
        return new Promise<string>((resolve) => {
          if (requestPersistentHandle_ShouldError) throw new Error(Expected)
          else resolve(Expected)
        })
      })
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Anchor as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Anchor.delete).toHaveBeenCalledTimes(0)
      createAnchorSpy({} as XRRigidTransform, {} as XRSpace)
      Anchor.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(1)
      expect(Anchor.delete).toHaveBeenCalledTimes(1)
      // Run the process
      let resultTuple: [XRAnchor, string | undefined] | undefined = undefined
      try {
        resultTuple = await XRAnchorFunctions.createPersistentAnchor(xrFrame, new Vector3(), new Quaternion())
      } catch (error) {
        expect(true).eq(
          false,
          "XRAnchorFunctions.createPersistentAnchor shouldn't throw an error under the defined conditions."
        )
      }
      // Check the result
      assert(resultTuple)
      expect(typeof resultTuple[1]).toBe('string') // The XRAnchor is at result[0]
      expect(createAnchorSpy).toHaveBeenCalledTimes(2)
      expect(Anchor.delete).toHaveBeenCalledTimes(1)
      const result = resultTuple[1]
      expect(result).toBe(Expected)
    })

    it('should call anchor.delete and throw the error thrown by anchor.requestPersistentHandle when anchor.requestPersistentHandle failed and both `@param xrFrame` and ReferenceSpace.origin are truthy', async () => {
      const Expected = 'arstarst'
      const requestPersistentHandle_ShouldError = true
      // Set the data as expected
      const Anchor = new MockXRAnchor()
      Anchor.delete = vi.fn()
      Anchor['requestPersistentHandle'] = vi.fn(() => {
        return new Promise<string>((resolve) => {
          if (requestPersistentHandle_ShouldError) throw new Error(Expected)
          else resolve(Expected)
        })
      })
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Anchor as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Anchor.delete).toHaveBeenCalledTimes(0)
      createAnchorSpy({} as XRRigidTransform, {} as XRSpace)
      Anchor.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(1)
      expect(Anchor.delete).toHaveBeenCalledTimes(1)
      // Run the process
      let resultTuple: [XRAnchor, string | undefined] | undefined = undefined
      try {
        resultTuple = await XRAnchorFunctions.createPersistentAnchor(xrFrame, new Vector3(), new Quaternion())
        expect(true).eq(
          false,
          'XRAnchorFunctions.createPersistentAnchor should throw an error under the defined conditions.'
        )
      } catch (error) {
        // Check the result
        expect(resultTuple).toBe(undefined)
        expect(createAnchorSpy).toHaveBeenCalledTimes(2)
        expect(Anchor.delete).toHaveBeenCalledTimes(2)
      }
    })

    it('should throw an error if either of `@param xrFrame` and ReferenceSpace.origin is falsy', async () => {
      const Expected = new MockXRAnchor()
      // Set the data as expected
      Expected.delete = vi.fn()
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Expected as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      ReferenceSpace.origin = null
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).not.toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
      // Run the process
      try {
        await XRAnchorFunctions.createPersistentAnchor(xrFrame, new Vector3(), new Quaternion())
      } catch (error) {
        expect(error.message).toMatch('XRFrame not available.')
      }
      // Check the result
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
    })
  }) //:: createPersistentAnchor

  describe('restoreAnchor', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should call xrFrame.session.restorePersistentAnchor with `@param uuid` when `@param xrFrame.session` is truthy', async () => {
      // Set the data as expected
      const xrFrame = getState(XRState).xrFrame
      const uuid = 'starstars'
      const resultSpy = vi.fn()
      // @ts-expect-error
      getMutableState(XRState).xrFrame.get()!.session.restorePersistentAnchor = resultSpy
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame.session).toBeTruthy()
      expect(xrFrame.session).not.toBe(null)
      expect(xrFrame.session).not.toBe(undefined)
      expect(resultSpy).not.toHaveBeenCalled()
      // Run the process
      try {
        await XRAnchorFunctions.restoreAnchor(xrFrame, uuid)
      } catch (error) {
        expect(true).eq(
          false,
          'XRAnchorFunctions.restoreAnchor should not throw an error under the defined conditions.\nError found:\n  ' +
            error
        )
      }
      // Check the result
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledWith(uuid)
    })

    it('should throw an error if `@param xrFrame.session` is falsy', async () => {
      // Set the data as expected
      const mockedXRFrame = new MockXRFrame()
      mockedXRFrame['session'] = null
      // @ts-expect-error Allow coercing MockXRFrame into XRFrame
      const xrFrame = mockedXRFrame as XRFrame
      const uuid = 'starstars'
      // Sanity check before running
      expect(xrFrame.session).toBeFalsy()
      expect(xrFrame.session).toBe(null)
      // Run the process
      try {
        await XRAnchorFunctions.restoreAnchor(xrFrame, uuid)
        expect(true).eq(false, 'XRAnchorFunctions.restoreAnchor should throw an error under the defined conditions.')
      } catch (error) {
        // Check the result
        expect(error.message).toMatch('XRSession not available.')
      }
    })
  }) //:: restoreAnchor

  describe('deleteAnchor', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should call xrFrame.session.deletePersistentAnchor with `@param uuid` when `@param xrFrame.session` is truthy', async () => {
      // Set the data as expected
      const xrFrame = getState(XRState).xrFrame
      const uuid = 'starstars'
      const resultSpy = vi.fn()
      // @ts-expect-error
      getMutableState(XRState).xrFrame.get()!.session.deletePersistentAnchor = resultSpy
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame.session).toBeTruthy()
      expect(xrFrame.session).not.toBe(null)
      expect(xrFrame.session).not.toBe(undefined)
      expect(resultSpy).not.toHaveBeenCalled()
      // Run the process
      try {
        await XRAnchorFunctions.deleteAnchor(xrFrame, uuid)
      } catch (error) {
        expect(true).eq(false, 'XRAnchorFunctions.deleteAnchor should not throw an error under the defined conditions.')
      }
      // Check the result
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledWith(uuid)
    })

    it('should throw an error if `@param xrFrame.session` is falsy', async () => {
      // Set the data as expected
      const mockedXRFrame = new MockXRFrame()
      mockedXRFrame['session'] = null
      // @ts-expect-error Allow coercing MockXRFrame into XRFrame
      const xrFrame = mockedXRFrame as XRFrame
      const uuid = 'starstars'
      // Sanity check before running
      expect(xrFrame.session).toBeFalsy()
      expect(xrFrame.session).toBe(null)
      // Run the process
      try {
        await XRAnchorFunctions.deleteAnchor(xrFrame, uuid)
        expect(true).eq(false, 'XRAnchorFunctions.deleteAnchor should throw an error under the defined conditions.')
      } catch (error) {
        // Check the result
        expect(error.message).toMatch('XRSession not available.')
      }
    })
  }) //:: deleteAnchor

  describe('anchors', () => {
    it('should start empty', () => {
      expect(XRAnchorFunctions.anchors.size).toBe(0)
    })

    it('should have the correct type', () => {
      expect(typeof XRAnchorFunctions.anchors).toBe('object')
      expect(XRAnchorFunctions.anchors).toBeInstanceOf(Set)
    })
  }) //:: anchors

  describe('anchorPoses', () => {
    it('should start empty', () => {
      expect(XRAnchorFunctions.anchorPoses.size).toBe(0)
    })

    it('should have the correct type', () => {
      expect(typeof XRAnchorFunctions.anchorPoses).toBe('object')
      expect(XRAnchorFunctions.anchorPoses).toBeInstanceOf(Map)
    })
  }) //:: anchorPoses
}) //:: XRAnchorFunctions

describe('XRPersistentAnchorSystem', () => {
  const System = SystemDefinitions.get(XRPersistentAnchorSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRPersistentAnchorSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRPersistentAnchorSystem).toBe('ee.engine.XRPersistentAnchorSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo Very Branchy */
  describe('execute', () => {}) //:: execute
}) //:: XRPersistentAnchorSystem
