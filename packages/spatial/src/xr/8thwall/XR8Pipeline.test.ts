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

import { afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getIncomingAction } from '../../../tests/util/actionHelpers'
import { assertVec } from '../../../tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../../tests/webxr/emulator'

import { SystemDefinitions, createEngine, createEntity, destroyEngine, setComponent } from '@ir-engine/ecs'
import { startReactor } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { PersistentAnchorActions, PersistentAnchorComponent } from '../XRAnchorComponents'
import { XR8, XR8System } from './XR8'
import { XR8Pipeline } from './XR8Pipeline'
import {
  WayspotFoundEvent,
  WayspotFoundEventFn,
  WayspotLostEvent,
  WayspotLostEventFn,
  WayspotScanningEvent,
  WayspotScanningEventFn,
  WayspotUpdatedEvent,
  WayspotUpdatedEventFn
} from './XR8Types'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XR8Pipeline', () => {
  describe('name', () => {
    it('should return an object that has the expected *.name value', () => {
      const result = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
      expect(result.name).toBe('EE_CameraPipeline')
    })
  }) //:: XR8Pipeline.name

  /** @todo */
  describe('onStart', () => {
    const System = SystemDefinitions.get(XR8System)!

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      // initialize8thwall
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    /** @todo Running this reactor fails. Might need specific XR8 setup or mock data */
    it.todo('...', () => {
      setComponent(createEntity(), PersistentAnchorComponent)
      const root = startReactor(System.reactor!)
      root.run()
      const arst = XR8.Threejs.xrScene()
      console.log(arst)
    })
  }) //:: XR8Pipeline.onStart

  /** @todo How to test that orientCameraFeed has run */
  describe('onAttach', () => {}) //:: XR8Pipeline.onAttach
  describe('onDeviceOrientationChange', () => {}) //:: XR8Pipeline.onDeviceOrientationChange

  describe('listeners', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should contain the expected list of events', () => {
      const Expected = [
        'reality.projectwayspotfound',
        'reality.projectwayspotscanning',
        'reality.projectwayspotlost',
        'reality.projectwayspotupdated'
      ]
      const result = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
      for (const listener of result.listeners!) expect(Expected).toContain(listener.event)
    })

    it('should contain a list of events that have correctly defined processes', () => {
      const result = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
      for (const listener of result.listeners!) {
        expect(listener.process).not.toBe(undefined)
        expect(typeof listener.process).toBe('function')
      }
    })

    describe("'reality.projectwayspotscanning' : onWayspotScanning", () => {
      const EventName = 'reality.projectwayspotscanning'
      let onEvent: WayspotScanningEventFn

      beforeEach(() => {
        const pipeline = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
        for (const listener of pipeline.listeners!) {
          if (listener.event === EventName) {
            onEvent = listener.process as WayspotScanningEventFn
            break
          }
        }
      })

      it('should be a valid function (it does nothing, except call `console.log` for the `@param event`)', () => {
        const Expected = { name: 'SomeTestingName' } as unknown as WayspotScanningEvent
        // Sanity check before running
        expect(onEvent).not.toBe(undefined)
        expect(typeof onEvent).toBe('function')
        // Run and Check the result
        onEvent(Expected)
      })
    }) //:: XR8Pipeline.listeners.'reality.projectwayspotscanning'

    describe("'reality.projectwayspotfound' : onWayspotFound", () => {
      const EventName = 'reality.projectwayspotfound'
      let onEvent: WayspotFoundEventFn

      beforeEach(() => {
        const pipeline = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
        for (const listener of pipeline.listeners!) {
          if (listener.event === EventName) {
            onEvent = listener.process as WayspotFoundEventFn
            break
          }
        }
      })

      it('should call dispatchAction(PersistentAnchorActions.anchorFound) with the detail.(name,position,rotation) of the `@param event`', () => {
        const Expected = {
          detail: {
            name: 'SomeTestingName',
            position: new Vector3(42, 43, 44),
            rotation: new Quaternion(1, 2, 3, 4).normalize()
          }
        } as unknown as WayspotFoundEvent
        // Sanity check before running
        expect(onEvent).not.toBe(undefined)
        expect(typeof onEvent).toBe('function')
        // Run and Check the result
        onEvent(Expected)
        const result = getIncomingAction(PersistentAnchorActions.anchorFound.type)
        assert(result)
        expect(typeof result).toBe('object')
        // @ts-expect-error Silence error about the name property not existing
        expect(result.name).toBe(Expected.detail.name)
        // @ts-expect-error Silence error about the position property not existing
        assertVec.approxEq(result.position, Expected.detail.position, 3)
        // @ts-expect-error Silence error about the rotation property not existing
        assertVec.approxEq(result.rotation, Expected.detail.rotation, 4)
      })
    }) //:: XR8Pipeline.listeners.'reality.projectwayspotfound'

    describe("'reality.projectwayspotupdated' : onWayspotUpdate", () => {
      const EventName = 'reality.projectwayspotupdated'
      let onEvent: WayspotUpdatedEventFn
      beforeEach(() => {
        const pipeline = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
        for (const listener of pipeline.listeners!) {
          if (listener.event === EventName) {
            onEvent = listener.process as WayspotUpdatedEventFn
            break
          }
        }
      })

      it('should call dispatchAction(PersistentAnchorActions.anchorUpdated) with the detail.(name,position,rotation) of the `@param event`', () => {
        const Expected = {
          detail: {
            name: 'SomeTestingName',
            position: new Vector3(42, 43, 44),
            rotation: new Quaternion(1, 2, 3, 4).normalize()
          }
        } as unknown as WayspotUpdatedEvent
        // Sanity check before running
        expect(onEvent).not.toBe(undefined)
        expect(typeof onEvent).toBe('function')
        // Run and Check the result
        onEvent(Expected)
        const result = getIncomingAction(PersistentAnchorActions.anchorUpdated.type)
        assert(result)
        expect(typeof result).toBe('object')
        // @ts-expect-error Silence error about the name property not existing
        expect(result.name).toBe(Expected.detail.name)
        // @ts-expect-error Silence error about the position property not existing
        assertVec.approxEq(result.position, Expected.detail.position, 3)
        // @ts-expect-error Silence error about the rotation property not existing
        assertVec.approxEq(result.rotation, Expected.detail.rotation, 4)
      })
    }) //:: XR8Pipeline.listeners.'reality.projectwayspotupdated'

    describe("'reality.projectwayspotlost' : onWayspotLost", () => {
      const EventName = 'reality.projectwayspotlost'
      let onEvent: WayspotLostEventFn

      beforeEach(() => {
        const pipeline = XR8Pipeline(document.getElementById('canvas')! as HTMLCanvasElement)
        for (const listener of pipeline.listeners!) {
          if (listener.event === EventName) {
            onEvent = listener.process as WayspotLostEventFn
            break
          }
        }
      })

      it('should call dispatchAction(PersistentAnchorActions.anchorLost) with the detail.(name) of the `@param event`', () => {
        const Expected = { detail: { name: 'SomeTestingName' } } as unknown as WayspotLostEvent
        // Sanity check before running
        expect(onEvent).not.toBe(undefined)
        expect(typeof onEvent).toBe('function')
        // Run and Check the result
        onEvent(Expected)
        // Run and Check the result
        onEvent(Expected)
        const result = getIncomingAction(PersistentAnchorActions.anchorLost.type)
        assert(result)
        expect(typeof result).toBe('object')
        // @ts-expect-error Silence error about the name property not existing
        expect(result.name).toBe(Expected.detail.name)
      })
    }) //:: XR8Pipeline.listeners.'reality.projectwayspotlost'
  }) //:: XR8Pipeline.listeners
}) //:: XR8Pipeline
