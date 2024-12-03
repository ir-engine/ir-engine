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

import { UndefinedEntity, createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { getState, setInitialState } from '@ir-engine/hyperflux'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { MediaSettingsState } from '../../audio/MediaSettingsState'
import { MediaSettingsComponent } from './MediaSettingsComponent'

describe('MediaSettingsComponent.ts', () => {
  const assertDatasetsEquals = (actual, expected) => {
    for (const [key, value] of Object.entries(actual)) {
      assert.equal(actual[key], expected[key])
    }
  }

  let entity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('Should set the name to MediaSettingsComponent', () => {
    assert.equal(MediaSettingsComponent.name, 'MediaSettingsComponent')
  })
  it('Should set the jsonID to EE_media_settings', () => {
    assert.equal(MediaSettingsComponent.jsonID, 'EE_media_settings')
  })
  it('Should set the initial data correctly', () => {
    setComponent(entity, MediaSettingsComponent)
    const actualInitialData = getComponent(entity, MediaSettingsComponent)
    const expectedInitialData = {
      immersiveMedia: false,
      refDistance: 20,
      rolloffFactor: 1,
      maxDistance: 10000,
      distanceModel: 'linear',
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0
    }
    // Check initial value set
    assertDatasetsEquals(actualInitialData, expectedInitialData)
    const distanceValue: 'exponential' | 'inverse' | 'linear' | undefined = 'inverse'
    const expectedChangedData = {
      immersiveMedia: true,
      refDistance: 2,
      rolloffFactor: 1,
      maxDistance: 10030,
      distanceModel: distanceValue,
      coneInnerAngle: 60,
      coneOuterAngle: 9,
      coneOuterGain: 43
    }
    setComponent(entity, MediaSettingsComponent, expectedChangedData)
    const changedData = getComponent(entity, MediaSettingsComponent)
    // Check that data is set correctly on change
    assertDatasetsEquals(changedData, expectedChangedData)
  })

  it('Should update the MediaSettingsState to the match the values of MediaSettingsComponent', () => {
    setInitialState(MediaSettingsState)
    setComponent(entity, MediaSettingsComponent)
    const initialComponentValues = getComponent(entity, MediaSettingsComponent)
    const initialStateValues = getState(MediaSettingsState)
    // Check that the props in state are updated to match those on component when component is called
    assertDatasetsEquals(initialComponentValues, initialStateValues)
    // Reusing code from above test case
    const distanceValue: 'exponential' | 'inverse' | 'linear' | undefined = 'inverse'
    const expectedChangedData = {
      immersiveMedia: true,
      refDistance: 2,
      rolloffFactor: 1,
      maxDistance: 10030,
      distanceModel: distanceValue,
      coneInnerAngle: 60,
      coneOuterAngle: 9,
      coneOuterGain: 43
    }
    setComponent(entity, MediaSettingsComponent, expectedChangedData)
    const updatedByUseffect = getState(MediaSettingsState)
    // Check that the state props also updates on prop change inside component and not just on component call
    assertDatasetsEquals(updatedByUseffect, expectedChangedData)
  })
})
