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

import {
  Easing,
  Entity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { StandardCallbacks } from '@ir-engine/spatial/src/common/CallbackComponent'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { NodeID } from '../../gltf/NodeIDComponent'
import { BehaviorComponent } from './BehaviorComponent'
import { MediaComponent } from './MediaComponent'
import { VideoTriggerComponent } from './OldTriggerComponents'
import { TriggerCallbackComponent } from './TriggerCallbackComponent'

describe('VideoTriggerComponent', () => {
  let entity: Entity
  const mediaEntityUUID = 'test-media-entity-uuid' as NodeID

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  afterEach(() => {
    removeEntity(entity)
    return destroyEngine()
  })

  it.only('should migrate to BehaviorComponent with correct data', async () => {
    // Set up the VideoTriggerComponent
    setComponent(entity, VideoTriggerComponent, {
      mediaEntityUUID,
      resetEnter: true,
      resetExit: false,
      targetAudioVolume: 0.8
    })

    // Create the expected behavior manually to match what the deserializer produces
    const expectedBehavior = {
      behaviors: [
        // enter behavior
        {
          conditions: [
            {
              type: 'callback' as const,
              callback: 'onEnter',
              nodeID: '' as NodeID
            }
          ],
          effects: [
            {
              type: 'callback',
              callback: StandardCallbacks.PLAY,
              nodeID: mediaEntityUUID,
              parameters: [true]
            },
            {
              type: 'transition' as const,
              nodeID: mediaEntityUUID,
              jsonID: MediaComponent.jsonID,
              propertyPath: 'volume',
              value: 0.8,
              duration: 1000,
              easing: Easing.exponential.in.path
            }
          ],
          networked: false
        },
        // exit behavior
        {
          conditions: [
            {
              type: 'callback' as const,
              callback: 'onExit',
              nodeID: '' as NodeID
            }
          ],
          effects: [
            {
              type: 'transition' as const,
              nodeID: mediaEntityUUID,
              jsonID: MediaComponent.jsonID,
              propertyPath: 'volume',
              value: 0,
              duration: 1000,
              easing: Easing.exponential.out.path
            },
            {
              type: 'callback',
              callback: StandardCallbacks.PAUSE,
              nodeID: mediaEntityUUID,
              parameters: []
            }
          ],
          networked: false
        }
      ]
    }

    // Render to trigger the reactor
    const { unmount } = render(null)
    await act(() => Promise.resolve())

    // Check that VideoTriggerComponent has been removed
    assert.equal(hasComponent(entity, VideoTriggerComponent), false, 'VideoTriggerComponent should be removed')

    // Check that TriggerCallbackComponent has been added
    assert.equal(hasComponent(entity, TriggerCallbackComponent), true, 'TriggerCallbackComponent should be added')

    // Check that BehaviorComponent has been added
    assert.equal(hasComponent(entity, BehaviorComponent), true, 'BehaviorComponent should be added')
    const actualBehavior = getComponent(entity, BehaviorComponent)

    // Check that there are two behaviors (enter and exit)
    assert.equal(actualBehavior.behaviors.length, 2, 'BehaviorComponent should have 2 behaviors')

    // Check the behavior structure
    const enterBehavior = actualBehavior.behaviors[0]
    const exitBehavior = actualBehavior.behaviors[1]

    // Now that the deserializer bug is fixed, each behavior should have 2 effects
    assert.equal(enterBehavior.effects.length, 2, 'Enter behavior should have 2 effects')
    assert.equal(exitBehavior.effects.length, 2, 'Exit behavior should have 2 effects')

    // Verify the effect is the transition effect
    assert.equal(enterBehavior.effects[1].type, 'transition', 'Enter effect should be of type transition')
    assert.equal(exitBehavior.effects[0].type, 'transition', 'Exit effect should be of type transition')

    assert.equal(enterBehavior.effects[0].type, 'callback', 'Enter effect should be of type callback')
    assert.equal(exitBehavior.effects[1].type, 'callback', 'Exit effect should be of type callback')

    // Compare the actual behavior with the expected behavior
    expect(actualBehavior).toEqual(expectedBehavior)

    unmount()
  })

  it('should migrate to BehaviorComponent with custom parameters', async () => {
    // Set up the VideoTriggerComponent with custom parameters
    setComponent(entity, VideoTriggerComponent, {
      mediaEntityUUID,
      resetEnter: false, // Different from default
      resetExit: true, // Different from default
      targetAudioVolume: 0.5 // Different from default
    })

    // Create the expected behavior manually to match what the deserializer produces
    const expectedBehavior = {
      behaviors: [
        // enter behavior
        {
          conditions: [
            {
              type: 'callback' as const,
              callback: 'onEnter',
              nodeID: '' as NodeID
            }
          ],
          effects: [
            {
              type: 'callback',
              callback: StandardCallbacks.PLAY,
              nodeID: mediaEntityUUID,
              parameters: [true]
            },
            {
              type: 'transition' as const,
              nodeID: mediaEntityUUID,
              jsonID: MediaComponent.jsonID,
              propertyPath: 'volume',
              value: 0.5, // custom targetAudioVolume
              duration: 1000,
              easing: Easing.exponential.in.path
            }
          ],
          networked: false
        },
        // exit behavior
        {
          conditions: [
            {
              type: 'callback' as const,
              callback: 'onExit',
              nodeID: '' as NodeID
            }
          ],
          effects: [
            {
              type: 'transition' as const,
              nodeID: mediaEntityUUID,
              jsonID: MediaComponent.jsonID,
              propertyPath: 'volume',
              value: 0,
              duration: 1000,
              easing: Easing.exponential.out.path
            },
            {
              type: 'callback',
              callback: StandardCallbacks.PAUSE,
              nodeID: mediaEntityUUID,
              parameters: []
            }
          ],
          networked: false
        }
      ]
    }

    // Render to trigger the reactor
    const { unmount } = render(null)
    await act(() => Promise.resolve())

    // Check that VideoTriggerComponent has been removed
    assert.equal(hasComponent(entity, VideoTriggerComponent), false, 'VideoTriggerComponent should be removed')

    // Check that BehaviorComponent has been added
    assert.equal(hasComponent(entity, BehaviorComponent), true, 'BehaviorComponent should be added')
    const actualBehavior = getComponent(entity, BehaviorComponent)

    // Check that there are two behaviors (enter and exit)
    assert.equal(actualBehavior.behaviors.length, 2, 'BehaviorComponent should have 2 behaviors')

    // Check the behavior structure
    const enterBehavior = actualBehavior.behaviors[0]
    const exitBehavior = actualBehavior.behaviors[1]

    // Now that the deserializer bug is fixed, each behavior should have 2 effects
    assert.equal(enterBehavior.effects.length, 2, 'Enter behavior should have 2 effects')
    assert.equal(exitBehavior.effects.length, 2, 'Exit behavior should have 2 effects')

    // Verify the effect is the transition effect
    assert.equal(enterBehavior.effects[0].type, 'transition', 'Enter effect should be of type transition')
    assert.equal(exitBehavior.effects[0].type, 'transition', 'Exit effect should be of type transition')

    // Compare the actual behavior with the expected behavior
    expect(actualBehavior).toEqual(expectedBehavior)

    unmount()
  })
})
