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

import { AnimationSystemGroup, SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRCameraInputSystem, XRCameraUpdateSystem } from './XRCameraSystem'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRCameraInputSystem', () => {
  const System = SystemDefinitions.get(XRCameraInputSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRCameraInputSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRCameraInputSystem).toBe('ee.engine.XRCameraInputSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {
    describe('for every action in the XRAction.sessionChanged list ..', () => {
      // .. @todo How to check that these internal variables changed?
      it.todo('_currentDepthNear')
      it.todo('_currentDepthFar')
    })
    it.todo('should not do anything else if XRState.xrFrame is falsy', () => {})
    it.todo(
      'should set XRState.viewerPose to the result of XRState.xrFrame.getViewerPose(ReferenceSpace.localFloor) when ReferenceSpace.localFloor is truthy',
      () => {}
    )
    it.todo('should set XRState.viewerPose to undefined when ReferenceSpace.localFloor is falsy', () => {})
  }) //:: execute
}) //:: XRCameraInputSystem

describe('XRCameraUpdateSystem', () => {
  const System = SystemDefinitions.get(XRCameraUpdateSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRCameraUpdateSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRCameraUpdateSystem).toBe('ee.engine.XRCameraUpdateSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.before).not.toBe(undefined)
      expect(System.insert!.before!).toBe(AnimationSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  /* @note Same as updateXRCamera */
  describe('execute', () => {
    it.todo('should not do anything if EngineState.viewerEntity.RendererComponent.renderer is falsy', () => {})
    describe('for every action in the XRAction.sessionChanged list', () => {
      it.todo(
        '.. should call EngineState.viewerEntity.CameraComponent.updateProjectionMatrix() if action.active is falsy',
        () => {}
      )
    })
    describe('when XRState.session is null ..', () => {
      it.todo(
        '.. should set EngineState.viewerEntity.CameraComponent.cameras to an array containing the module-scope variable _cameraL',
        () => {}
      )
      it.todo('.. should call _cameraL.copy with (EngineState.viewerEntity.CameraComponent, false)', () => {})
      it.todo('.. should set _cameraL.viewport.x to 0', () => {})
      it.todo('.. should set _cameraL.viewport.y to 0', () => {})
      it.todo(
        '.. should set _cameraL.viewport.z to the result.width of calling EngineState.viewerEntity.RendererComponent.renderer.getDrawingBufferSize with (_vec)',
        () => {}
      )
      it.todo(
        '.. should set _cameraL.viewport.w to the result.height of calling EngineState.viewerEntity.RendererComponent.renderer.getDrawingBufferSize with (_vec)',
        () => {}
      )
      it.todo('.. should return early and not do anything else after this block', () => {})
    })
    it.todo('should call updateCameraFromXRViewerPose', () => {})
    it.todo('should set _cameraL.near and _cameraR.near to EngineState.viewerEntity.CameraComponent.near ', () => {})
    it.todo('should set _cameraL.far and _cameraR.far to EngineState.viewerEntity.CameraComponent.far ', () => {})
    describe('when either of _currentDepthNear/Far is not equal to its respective EngineState.viewerEntity.CameraComponent.near/far ..', () => {
      it.todo(
        '.. should call XRState.session.updateRenderState with EngineState.viewerEntity.CameraComponent.(near,far) ',
        () => {}
      )
      it.todo('..should set _currentDepthNear/Far to EngineState.viewerEntity.CameraComponent.near/far', () => {})
    })
    it.todo('should call updateProjectionFromCameraArrayUnion with EngineState.viewerEntity.CameraComponent', () => {})
  }) //:: execute
}) //:: XRCameraUpdateSystem
