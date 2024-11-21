// /*
// CPAL-1.0 License

// The contents of this file are subject to the Common Public Attribution License
// Version 1.0. (the "License"); you may not use this file except in compliance
// with the License. You may obtain a copy of the License at
// https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
// The License is based on the Mozilla Public License Version 1.1, but Sections 14
// and 15 have been added to cover use of software over a computer network and
// provide for limited attribution for the Original Developer. In addition,
// Exhibit A has been modified to be consistent with Exhibit B.

// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
// specific language governing rights and limitations under the License.

// The Original Code is Infinite Reality Engine.

// The Original Developer is the Initial Developer. The Initial Developer of the
// Original Code is the Infinite Reality Engine team.

// All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
// Infinite Reality Engine. All Rights Reserved.
// */

import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'

import assert from 'assert'
import { MathUtils } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  getComponent,
  getMutableComponent,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { createEntity, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { noiseAddToEffectRegistry } from '@ir-engine/engine/src/postprocessing/NoiseEffect'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { act, render } from '@testing-library/react'
import { Effect } from 'postprocessing'
import React from 'react'
import { EngineState } from '../../EngineState'
import { destroySpatialEngine, initializeSpatialEngine } from '../../initializeEngine'
import { RendererState } from '../RendererState'
import { PostProcessingComponent } from './PostProcessingComponent'

type PostProcessingComponentData = {
  enabled: boolean
  effects: Record<string, Effect>
}

const PostProcessingComponentDefaults = {
  enabled: false,
  effects: {}
} as PostProcessingComponentData

const TestShader = 'void main() { gl_FragColor = vec4(1.0,0.0,1.0,1.0); }'

function assertPostProcessingComponentEq(A: PostProcessingComponentData, B: PostProcessingComponentData) {
  assert.equal(A.enabled, B.enabled)
  assert.equal(Object.keys(A.effects).length, Object.keys(B.effects).length)

  for (const id in A.effects) {
    assert.equal(Object.keys(B.effects).includes(id), true)
    const a = A.effects[id]
    const b = B.effects[id]
    assert.equal(a.name, b.name)
    assert.equal(a.getFragmentShader(), b.getFragmentShader())
  }
}

describe('PostProcessingComponent', async () => {
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
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      initializeSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, PostProcessingComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized PostProcessingComponent', () => {
      const Expected = {
        enabled: true,
        effects: {
          effect1: new Effect('test.effect1', TestShader),
          effect2: new Effect('test.effect2', TestShader)
        }
      } as PostProcessingComponentData
      // Sanity check the data
      assertPostProcessingComponentEq(
        getComponent(testEntity, PostProcessingComponent),
        PostProcessingComponentDefaults
      )
      // Run and Check the result
      setComponent(testEntity, PostProcessingComponent, Expected)
      const result = getComponent(testEntity, PostProcessingComponent)
      assertPostProcessingComponentEq(result, Expected)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      initializeSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, PostProcessingComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it("should serialize the component's data as expected", () => {
      const Data = {
        enabled: true,
        effects: {
          effect1: new Effect('test.effect1', TestShader),
          effect2: new Effect('test.effect2', TestShader)
        }
      } as PostProcessingComponentData

      const Expected1 = {
        enabled: false,
        effects: {}
      }
      const Expected2 = {
        enabled: Data.enabled,
        effects: {
          effect1: {
            name: 'test.effect1',
            renderer: null,
            attributes: 0,
            fragmentShader: 'void main() { gl_FragColor = vec4(1.0,0.0,1.0,1.0); }',
            vertexShader: null,
            defines: {},
            uniforms: {},
            extensions: null,
            blendMode: {
              _blendFunction: 23,
              opacity: { value: 1 },
              _listeners: { change: [] }
            }, //:: blendMode
            _inputColorSpace: 'srgb-linear',
            _outputColorSpace: ''
          }, //:: effect1
          effect2: {
            name: 'test.effect2',
            renderer: null,
            attributes: 0,
            fragmentShader: 'void main() { gl_FragColor = vec4(1.0,0.0,1.0,1.0); }',
            vertexShader: null,
            defines: {},
            uniforms: {},
            extensions: null,
            blendMode: {
              _blendFunction: 23,
              opacity: { value: 1 },
              _listeners: { change: [] }
            }, //:: blendMode
            _inputColorSpace: 'srgb-linear',
            _outputColorSpace: ''
          } //:: effect2
        } //:: effects
      }
      const result1 = serializeComponent(testEntity, PostProcessingComponent)
      assert.deepEqual(result1, Expected1)
      setComponent(testEntity, PostProcessingComponent, Data)
      const result2 = serializeComponent(testEntity, PostProcessingComponent)
      assert.deepEqual(result2, Expected2)
    })
  }) //:: toJSON

  /**
  // @todo Write after the reactor has been replaced with spatial queries or distance checks
  describe('reactor', () => {}) //:: reactor
  */

  describe('General Purpose', async () => {
    let rootEntity = UndefinedEntity
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()

      mockSpatialEngine()

      rootEntity = getState(EngineState).viewerEntity

      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
      getMutableState(RendererState).usePostProcessing.set(true)
      setComponent(testEntity, SceneComponent)
      setComponent(testEntity, PostProcessingComponent, { enabled: true })
      setComponent(testEntity, EntityTreeComponent)

      //set data to test
      setComponent(rootEntity, RendererComponent, { scenes: [testEntity] })
    })

    afterEach(() => {
      removeEntity(testEntity)
      removeEntity(rootEntity)
      return destroyEngine()
    })

    it('should add and remove effects correctly', async () => {
      const effectKey = 'NoiseEffect'
      noiseAddToEffectRegistry()

      const { rerender, unmount } = render(<></>)

      await act(async () => rerender(PostProcessingComponent.reactor))

      const postProcessingComponent = getMutableComponent(testEntity, PostProcessingComponent)
      postProcessingComponent.effects[effectKey].isActive.set(true)

      setComponent(rootEntity, RendererComponent)
      await act(async () => rerender(PostProcessingComponent.reactor))

      // @ts-ignore Allow access to the EffectPass.effects private field
      const before = getComponent(rootEntity, RendererComponent).effectComposer.EffectPass.effects
      assert.equal(Boolean(before.find((el) => el.name == effectKey)), true, effectKey + ' should be turned on')

      postProcessingComponent.effects[effectKey].isActive.set(false)

      await act(async () => rerender(PostProcessingComponent.reactor))

      // @ts-ignore Allow access to the EffectPass.effects private field
      const after = getComponent(rootEntity, RendererComponent).effectComposer.EffectPass.effects
      assert.equal(Boolean(after.find((el) => el.name == effectKey)), false, effectKey + ' should be turned off')

      unmount()
    })
  })
})
