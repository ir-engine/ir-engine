/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import { getMutableState } from '@etherealengine/hyperflux'
import { destroyEngine, Engine } from '../../../../src/ecs/classes/Engine'
import { defineQuery, getComponent, hasComponent, setComponent } from '../../../../src/ecs/functions/ComponentFunctions'
import { createEngine } from '../../../../src/initializeEngine'
import { InputComponent } from '../../../../src/input/components/InputComponent'
import { InputSourceCaptureState, InputSourceComponent } from '../../../../src/input/components/InputSourceComponent'
import { loadEmptyScene } from '../../../util/loadEmptyScene'
import { MockXRInputSource, MockXRSpace } from '../../../util/MockXRInputSource'

describe('InputSourceComponent', () => {
  beforeEach(() => {
    createEngine()
    loadEmptyScene()
  })

  it('should be queryable', () => {
    const inputSourceQuery = defineQuery([InputSourceComponent])
    assert(inputSourceQuery)
    assert(inputSourceQuery._enterQuery)
    assert(inputSourceQuery._exitQuery)
    assert(inputSourceQuery._query)
  })

  it('should able to be set as a component', () => {
    const mockXRInputSource = new MockXRInputSource({
      handedness: 'left',
      targetRayMode: 'screen',
      targetRaySpace: new MockXRSpace() as XRSpace,
      gripSpace: undefined,
      gamepad: undefined,
      profiles: ['test'],
      hand: undefined
    }) as XRInputSource

    const entity = Engine.instance.originEntity

    setComponent(entity, InputSourceComponent, { source: mockXRInputSource })

    assert(hasComponent(entity, InputSourceComponent))

    const inputSourceComponent = getComponent(entity, InputSourceComponent)
    assert(inputSourceComponent !== undefined)

    const state = getMutableState(InputSourceCaptureState)
    InputSourceComponent.captureButtons(entity)
    assert(state.buttons['left'].get() === entity)
    assert(state.buttons['right'].get() === entity)
    assert(state.buttons['none'].get() === entity)

    InputSourceComponent.releaseButtons()
    assert(state.buttons['left'].get() === 0)
    assert(state.buttons['right'].get() === 0)
    assert(state.buttons['none'].get() === 0)

    InputSourceComponent.captureAxes(entity)
    assert(state.axes['left'].get() === entity)
    assert(state.axes['right'].get() === entity)
    assert(state.axes['none'].get() === entity)

    InputSourceComponent.releaseAxes()
    assert(state.axes['left'].get() === 0)
    assert(state.axes['right'].get() === 0)
    assert(state.axes['none'].get() === 0)

    InputSourceComponent.capture(entity)
    assert(state.buttons['left'].get() === entity)
    assert(state.buttons['right'].get() === entity)
    assert(state.buttons['none'].get() === entity)
    assert(state.axes['left'].get() === entity)
    assert(state.axes['right'].get() === entity)
    assert(state.axes['none'].get() === entity)

    InputSourceComponent.release()
    assert(state.buttons['left'].get() === 0)
    assert(state.buttons['right'].get() === 0)
    assert(state.buttons['none'].get() === 0)
    assert(state.axes['left'].get() === 0)
    assert(state.axes['right'].get() === 0)
    assert(state.axes['none'].get() === 0)

    let isAssignedButtons = InputSourceComponent.isAssignedButtons(entity)
    let isAssignedAxes = InputSourceComponent.isAssignedAxes(entity)

    assert(!isAssignedButtons)
    assert(!isAssignedAxes)

    inputSourceComponent.assignedAxesEntity = entity
    inputSourceComponent.assignedButtonEntity = entity
    setComponent(entity, InputComponent)
    const inputComponent = getComponent(entity, InputComponent)
    inputComponent.inputSources.push(entity)

    isAssignedButtons = InputSourceComponent.isAssignedButtons(entity)
    isAssignedAxes = InputSourceComponent.isAssignedAxes(entity)

    assert(isAssignedButtons)
    assert(isAssignedAxes)
  })

  afterEach(() => {
    destroyEngine()
  })
})
