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

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../../../spatial/tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../../../spatial/tests/webxr/emulator'

import { AnimationSystemGroup, createEngine, destroyEngine, SystemDefinitions, SystemUUID } from '@ir-engine/ecs'
import { TransformSystem } from '@ir-engine/spatial'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import { DropShadowSystem, ShadowSystem, ShadowSystemState } from './ShadowSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('ShadowSystemState', () => {
  describe('name', () => {
    it('should have the expected name', () => {
      const Expected = 'ee.engine.scene.ShadowSystemState'
      const result = ShadowSystemState.name
      expect(result).toBe(Expected)
    })
  }) //:: name

  describe('initial', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    /** @todo How to change the value of isMobileXRHeadset to true */
    it.todo('should have an accumulationBudget of 4 when isMobileXRHeadset is truthy', async () => {
      const Expected = 4
      // Set the data as expected
      // Sanity check before running
      expect(isMobileXRHeadset).toBeTruthy()
      // Run and Check the result
      const result = (await ShadowSystemState.initial()).priorityQueue.accumulationBudget
      expect(result).toEqual(Expected)
    })

    it('should have an accumulationBudget of 20 when isMobileXRHeadset is falsy', async () => {
      const Expected = 20
      // Sanity check before running
      expect(isMobileXRHeadset).toBeFalsy()
      // Run and Check the result
      const result = (await ShadowSystemState.initial()).priorityQueue.accumulationBudget
      expect(result).toEqual(Expected)
    })
  }) //:: initial
}) //:: ShadowSystemState

describe('CSMReactor', () => {
  describe('EntityCSMReactor', () => {}) //:: EntityCSMReactor
  describe('EntityChildCSMReactor', () => {}) //:: EntityChildCSMReactor
}) //:: CSMReactor

describe('RenderSettingsQueryReactor', () => {}) //:: RenderSettingsQueryReactor
describe('DropShadowReactor', () => {}) //:: DropShadowReactor
describe('updateDropShadowTransforms', () => {}) //:: updateDropShadowTransforms
describe('RendererShadowReactor', () => {}) //:: RendererShadowReactor

describe('ShadowSystem', () => {
  const System = SystemDefinitions.get(ShadowSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.ShadowSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(ShadowSystem).toBe('ee.engine.ShadowSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(AnimationSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {
    it.todo('should not do anything if the result of getShadowsEnabled is falsy', () => {})
    describe('for every entity that has a RendererComponent', () => {
      it.todo('should call entity.RendererComponent.csm.update if entity.RendererComponent.csm is truthy', () => {})
      it.todo('should not call entity.RendererComponent.csm.update if entity.RendererComponent.csm is falsy', () => {})
    })
  }) //:: execute

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: ShadowSystem

describe('DropShadowSystem', () => {
  const System = SystemDefinitions.get(DropShadowSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.DropShadowSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(DropShadowSystem).toBe('ee.engine.DropShadowSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(TransformSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {
    it.todo(
      'should call ShadowSystemFunctions.updateDropShadowTransforms when the result of getShadowsEnabled is falsy',
      () => {}
    )
    it.todo(
      'should not call ShadowSystemFunctions.updateDropShadowTransforms when the result of getShadowsEnabled is truthy',
      () => {}
    )
  }) //:: execute
}) //:: DropShadowSystem

describe('ShadowSystemFunctions', () => {
  describe('updateDropShadowTransforms', () => {}) //:: updateDropShadowTransforms
}) //:: ShadowSystemFunctions
