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
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, UndefinedEntity, createEngine, destroyEngine } from '@ir-engine/ecs'
import { CubeTexture, LightProbe } from 'three'
import { XRLightProbeState, XRLightProbeSystem } from './XRLightProbeSystem'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRLightProbeSystem', () => {
  const System = SystemDefinitions.get(XRLightProbeSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRLightProbeSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRLightProbeSystem).toBe('ee.engine.XRLightProbeSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute,', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: XRLightProbeSystem

describe('XRLightProbeState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      expect(XRLightProbeState.name).toBe('ee.xr.LightProbe')
    })

    it('should initialize the *State with the expected initial values', () => {
      const Expected = {
        isEstimatingLight: false,
        lightProbe: new LightProbe(),
        probe: null as XRLightProbe | null,
        directionalLightEntity: UndefinedEntity,
        environment: null as CubeTexture | null,
        xrWebGLBinding: null as XRWebGLBinding | null
      }
      const result = XRLightProbeState.initial()
      expect(result['isEstimatingLight']).toEqual(Expected['isEstimatingLight'])
      expect(result['lightProbe']['metadata']).toEqual(Expected['lightProbe']['metadata'])
      expect(result['lightProbe']['object']).toEqual(Expected['lightProbe']['object'])
      expect(result['probe']).toEqual(Expected['probe'])
      expect(result['directionalLightEntity']).toEqual(Expected['directionalLightEntity'])
      expect(result['environment']).toEqual(Expected['environment'])
      expect(result['xrWebGLBinding']).toEqual(Expected['xrWebGLBinding'])
    })
  }) //:: Fields
}) //:: XRLightProbeState
