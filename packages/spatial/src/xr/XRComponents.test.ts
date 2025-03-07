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

import { UndefinedEntity, createEngine, createEntity, destroyEngine, setComponent } from '@ir-engine/ecs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assertArray } from '../../tests/util/assert'
import {
  XRAnchorComponent,
  XRHandComponent,
  XRHitTestComponent,
  XRLeftHandComponent,
  XRRightHandComponent,
  XRSpaceComponent
} from './XRComponents'

const XRHandRotationDefaults = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]

function assertXRHandComponentDefaults(data: any) {
  assertArray.eq([...data.rotations.values()], XRHandRotationDefaults)
  expect(data.hand).toBeNull()
}

describe('XRHandComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRHandComponent.name).toBe('XRHandComponent')
    })
  }) //:: Fields
}) //:: XRHandComponent

describe('XRLeftHandComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRLeftHandComponent.name).toBe('XRLeftHandComponent')
    })
  }) //:: Fields

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      destroyEngine()
    })

    it("should initialize the Component's data with the expected default values", () => {
      const result = setComponent(testEntity, XRLeftHandComponent)
      assertXRHandComponentDefaults(result)
    })
  }) //:: onInit
}) //:: XRLeftHandComponent

describe('XRRightHandComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRRightHandComponent.name).toBe('XRRightHandComponent')
    })
  }) //:: Fields

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      destroyEngine()
    })

    it("should initialize the Component's data with the expected default values", () => {
      const result = setComponent(testEntity, XRLeftHandComponent)
      assertXRHandComponentDefaults(result)
    })
  }) //:: onInit
}) //:: XRRightHandComponent

describe('XRHitTestComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRHitTestComponent.name).toBe('XRHitTestComponent')
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRHitTestComponent

describe('XRAnchorComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRAnchorComponent.name).toBe('XRAnchorComponent')
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRAnchorComponent

describe('XRSpaceComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRSpaceComponent.name).toBe('XRSpaceComponent')
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRSpaceComponent
