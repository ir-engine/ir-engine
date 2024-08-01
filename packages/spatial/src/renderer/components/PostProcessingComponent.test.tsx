// /*
// CPAL-1.0 License

// The contents of this file are subject to the Common Public Attribution License
// Version 1.0. (the "License"); you may not use this file except in compliance
// with the License. You may obtain a copy of the License at
// https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
// The License is based on the Mozilla Public License Version 1.1, but Sections 14
// and 15 have been added to cover use of software over a computer network and
// provide for limited attribution for the Original Developer. In addition,
// Exhibit A has been modified to be consistent with Exhibit B.

// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
// specific language governing rights and limitations under the License.

// The Original Code is Ethereal Engine.

// The Original Developer is the Initial Developer. The Initial Developer of the
// Original Code is the Ethereal Engine team.

// All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
// Ethereal Engine. All Rights Reserved.
// */

import assert from 'assert'
import { MathUtils } from 'three'

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  getComponent,
  getMutableComponent,
  setComponent
} from '@etherealengine/ecs'
import { createEngine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { noiseAddToEffectRegistry } from '@etherealengine/engine/src/postprocessing/NoiseEffect'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import { Effect } from 'postprocessing'
import React from 'react'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { EngineState } from '../../EngineState'
import { RendererState } from '../RendererState'
import { PostProcessingComponent } from './PostProcessingComponent'

describe('PostProcessingComponent', () => {
  let rootEntity: Entity
  let entity: Entity

  beforeEach(() => {
    createEngine()

    mockSpatialEngine()

    rootEntity = getState(EngineState).viewerEntity

    entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    getMutableState(RendererState).usePostProcessing.set(true)
    setComponent(entity, SceneComponent)
    setComponent(entity, PostProcessingComponent, { enabled: true })
    setComponent(entity, EntityTreeComponent)

    //set data to test
    setComponent(rootEntity, RendererComponent, { scenes: [entity] })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Create default post processing component', () => {
    const postProcessingComponent = getComponent(entity, PostProcessingComponent)
    assert(postProcessingComponent, 'post processing component exists')
  })

  it('Test Effect Composure amd Highlight Effect', async () => {
    const effectKey = 'OutlineEffect'

    //force nested reactors to run
    const { rerender, unmount } = render(<></>)
    await act(() => rerender(<></>))

    const effectComposer = getComponent(rootEntity, RendererComponent).effectComposer
    console.log(getComponent(rootEntity, RendererComponent))

    //test that the effect composer is setup
    assert(effectComposer, 'effect composer is setup')

    //test that the effect pass has the the effect set
    const effects = (effectComposer?.EffectPass as any).effects
    assert(effects.find((el) => el.name == effectKey))

    unmount()
  })

  it('Test Effect Add and Remove', async () => {
    const effectKey = 'NoiseEffect'
    noiseAddToEffectRegistry()

    const { rerender, unmount } = render(<></>)

    await act(() => rerender(<></>))

    const postProcessingComponent = getMutableComponent(entity, PostProcessingComponent)
    postProcessingComponent.effects[effectKey].isActive.set(true)

    setComponent(rootEntity, RendererComponent)
    await act(() => rerender(<></>))

    // @ts-ignore
    let effects = getComponent(rootEntity, RendererComponent).effectComposer.EffectPass.effects
    console.log(
      getComponent(rootEntity, RendererComponent).effects,
      effects.map((el) => el.name)
    )
    assert(
      effects.find((el) => el.name == effectKey),
      ' Effect turned on'
    )

    postProcessingComponent.effects[effectKey].isActive.set(false)

    await act(() => rerender(<></>))

    // @ts-ignore
    effects = getComponent(rootEntity, RendererComponent).effectComposer.EffectPass.effects
    assert(!effects.find((el) => el.name == effectKey), ' Effect turned off')

    removeEntity(entity)
    unmount()
  })
})

const PostProcessingComponentDefaults = {
  enabled: false,
  effects: {} as Record<string, Effect> // effect name, parameters
}

function assertPostProcessingComponentEq(A, B) {
  assert.equal(A.enabled, B.enabled)
  /** @todo Check other properties */
}

describe('PostProcessingComponent', () => {
  describe('IDs', () => {
    it('should initialize the PostProcessingComponent.name field with the expected value', () => {
      assert.equal(PostProcessingComponent.name, 'PostProcessingComponent')
    })

    it('should initialize the PostProcessingComponent.jsonID field with the expected value', () => {
      assert.equal(PostProcessingComponent.jsonID, 'EE_postprocessing')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, PostProcessingComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, PostProcessingComponent)
      assertPostProcessingComponentEq(data, PostProcessingComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    // it('should change the values of an initialized PostProcessingComponent', () => {})
    // it('should not change values of an initialized PostProcessingComponent when the data passed had incorrect types', () => {})
  }) //:: onSet

  describe('toJSON', () => {}) //:: toJSON
  describe('reactor', () => {}) //:: reactor
})
