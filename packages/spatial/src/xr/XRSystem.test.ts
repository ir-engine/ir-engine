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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { InputSystemGroup, SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRSystem, XRSystemFunctions } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRSystem', () => {
  const System = SystemDefinitions.get(XRSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRSystem).toBe('ee.engine.XRSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.before).not.toBe(undefined)
      expect(System.insert!.before!).toBe(InputSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {
    // @todo When system mounting/unmounting is exposed
    describe('mount/unmount', () => {
      it.skip("should call navigator.xr.addEventListener with 'devicechange'  and updateSessionSupport", () => {})
      it.skip('should call XRSystemFunctions.updateSessionSupport', () => {
        // Set the data as expected
        const resultSpy = vi.spyOn(XRSystemFunctions, 'updateSessionSupport')
        // Sanity check before running
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      describe('when it unmounts ..', () => {
        it.skip(".. should call navigator.xr.removeEventListener with 'devicechange'  and XRSystemFunctions.updateSessionSupport", () => {})
      }) //:: unmount
    })
  }) //:: reactor

  /** @todo */
  describe('execute,', () => {}) //:: execute
}) //:: XRSystem
