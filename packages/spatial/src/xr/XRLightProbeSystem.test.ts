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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
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
  describe('reactor', () => {
    // @todo When system mounting/unmounting is exposed
    describe('on mount', () => {
      it.skip('should set XRLightProbeState.lightProbe.intensity to 0', () => {})
    }) //:: on mount

    describe('XRState.session', () => {
      it.todo('should not do anything if XRState.session.value is falsy', () => {})
      it.todo('should not do anything if XRState.session.requestLightProbe does not exist on the object', () => {})
      it.todo(
        'should call XRState.session.requestLightProbe with {reflectionFormat: session.preferredReflectionFormat}',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.probe to the XRLightProbe returned by XRState.session.requestLightProbe when the promise resolves correctly',
        () => {}
      )
      it.todo(
        'should not set XRLightProbeState.probe to the XRLightProbe returned by XRState.session.requestLightProbe when the promise does not resolve correctly',
        () => {}
      )

      describe('when the component unmounts ..', () => {
        it.todo('.. should set XRLightProbeState.environment to null', () => {})
        it.todo('.. should set XRLightProbeState.xrWebGLBinding to null', () => {})
        it.todo('.. should set XRLightProbeState.isEstimatingLight to null', () => {})
        it.todo('.. should set XRLightProbeState.probe to null', () => {})
      }) //:: unmount
    }) //:: XRState.session

    describe('XRLightProbeState.isEstimatingLight', () => {
      it.todo('should not do anything if xrLightProbeState.isEstimatingLight.value is falsy', () => {})
      it.todo("should not do anything if xrState.sessionMode.value is not 'immersive-ar'", () => {})
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity and add a DirectionalLightComponent to the entity',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity, add a DirectionalLightComponent to the entity and set its intensity to 0',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity, add a DirectionalLightComponent to the entity and set its shadowBias to -0.000001',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity, add a DirectionalLightComponent to the entity and set its shadowRadius to 1',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity, add a DirectionalLightComponent to the entity and set its cameraFar to 2000',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity, add a DirectionalLightComponent to the entity and set its castShadow to true',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity and add a GroupComponent to the entity',
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.directionalLightEntity to a new entity and add a VisibleComponent to the entity',
        () => {}
      )
      describe('when the component unmounts ..', () => {
        it.todo('.. should set XRLightProbeState.directionalLightEntity to UndefinedEntity', () => {})
      })
    }) //:: XRLightProbeState.isEstimatingLight

    describe('XRLightProbeState.probe', () => {
      it.todo('should not do anything if XRState.session is falsy', () => {})
      it.todo('should not do anything if XRLightProbeState.probe.value is falsy', () => {})
      it.todo('should not do anything if XRWebGLBinding is not a property of window', () => {})
      it.todo(
        'should set XRLightProbeState.environment to the .texture property of a renderTarget created with new WebGLCubeRenderTarget(16)',
        () => {}
      )
      it.todo(
        "should call EngineState.viewerEntity.RendererComponent.renderer.getContext().getExtension with 'EXT_sRGB' when session.preferredReflectionFormat is 'srgba8'",
        () => {}
      )
      it.todo(
        "should call EngineState.viewerEntity.RendererComponent.renderer.getContext().getExtension with 'OES_texture_half_float' when session.preferredReflectionFormat is 'rgba16f'",
        () => {}
      )
      it.todo(
        'should set XRLightProbeState.xrWebGLBinding to a new instance of XRWebGLBinding created with XRState.session and EngineState.viewerEntity.RendererComponent.renderer.getContext() as arguments',
        () => {}
      )
      it.todo(
        "should call XRLightProbeState.probe.value.addEventListener with 'reflectionchange' and a function that calls XRLightProbeSystemFunctions.updateReflection()",
        () => {}
      )
    }) //:: XRLightProbeState.probe

    // @todo Figure out if its good to separate these two, or if it should remain one describe
    describe('[XRLightProbeState.environment.value, xrLightProbeState.directionalLightEntity.value]', () => {
      it.todo('should not do anything if one of the values is falsy', () => {})
      it.todo('should set an EnvironmentMapComponent on XRLightProbeState.directionalLightEntity', () => {})
      describe('when the component unmounts ..', () => {
        it.todo('.. should remove the EnvironmentMapComponent on XRLightProbeState.directionalLightEntity', () => {})
      }) //:: unmount
    }) //:: [XRLightProbeState.environment.value, xrLightProbeState.directionalLightEntity.value]
  }) //:: reactor

  /** @todo */
  describe('execute,', () => {}) //:: execute
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
