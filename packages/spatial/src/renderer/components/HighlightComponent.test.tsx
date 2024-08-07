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

import {
  EntityUUID,
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { MathUtils } from 'three'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { EngineState } from '../../EngineState'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { RendererState } from '../RendererState'
import { RendererComponent, WebGLRendererSystem } from '../WebGLRendererSystem'
import { HighlightComponent, HighlightSystem } from './HighlightComponent'
import { PostProcessingComponent } from './PostProcessingComponent'
import { SceneComponent } from './SceneComponents'

describe('HighlightComponent', () => {
  describe('IDs', () => {
    it('should initialize the HighlightComponent.name field with the expected value', () => {
      assert.equal(HighlightComponent.name, 'HighlightComponent')
    })
  }) //:: IDs
})

describe('HighlightSystem', () => {
  describe('IDs', () => {
    it('should initialize the HighlightSystem.uuid field with the expected value', () => {
      assert.equal(SystemDefinitions.get(HighlightSystem)!.uuid, 'HighlightSystem')
    })
  }) //:: IDs

  describe('insert', () => {
    it('should be set to run before the WebGLRendererSystem', () => {
      const insert = SystemDefinitions.get(HighlightSystem)!.insert
      assert.notEqual(insert, undefined)
      assert.equal(insert?.before, WebGLRendererSystem)
      assert.equal(insert?.with, undefined)
      assert.equal(insert?.after, undefined)
    })
  })

  /**
  // @todo
  describe('execute', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })
  })
  */

  describe('General Purpose', () => {
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
    })

    afterEach(() => {
      removeEntity(testEntity)
      removeEntity(rootEntity)
      return destroyEngine()
    })

    it('should add the OutlineEffect to the RendererComponent.effectComposer.EffectPass.effects list', async () => {
      const effectKey = 'OutlineEffect'

      // force nested reactors to run
      const { rerender, unmount } = render(<></>)
      await act(() => rerender(<></>))

      // Check that the effect composer is setup
      const effectComposer = getComponent(rootEntity, RendererComponent).effectComposer
      assert.notEqual(Boolean(effectComposer), false, 'the effect composer is not setup correctly')

      // Check that the effect pass has the the effect set
      // @ts-ignore Allow access to the `effects` private field
      const effects = effectComposer.EffectPass.effects
      assert.equal(Boolean(effects.find((it) => it.name == effectKey)), true)

      unmount()
    })
  })
})
