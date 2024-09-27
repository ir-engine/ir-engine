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

import { AnimationSystemGroup, SystemDefinitions, SystemUUID } from '@ir-engine/ecs'
import assert from 'assert'
import { TransformDirtyCleanupSystem, TransformDirtyUpdateSystem, TransformSystem } from './TransformSystem'

describe('TransformSystem', () => {
  const System = SystemDefinitions.get(TransformSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformSystem, 'ee.engine.TransformSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, AnimationSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: TransformSystem

describe('TransformDirtyUpdateSystem', () => {
  const System = SystemDefinitions.get(TransformDirtyUpdateSystem)!

  describe('Fields', () => {
    it('should initialize the ClientInputSystem.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformDirtyUpdateSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformDirtyUpdateSystem, 'ee.engine.TransformDirtyUpdateSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.before, undefined)
      assert.equal(System.insert!.before!, TransformSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
}) //:: TransformDirtyUpdateSystem

describe('TransformDirtyCleanupSystem', () => {
  const System = SystemDefinitions.get(TransformDirtyCleanupSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformDirtyCleanupSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformDirtyCleanupSystem, 'ee.engine.TransformDirtyCleanupSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, TransformSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
}) //:: TransformDirtyCleanupSystem
