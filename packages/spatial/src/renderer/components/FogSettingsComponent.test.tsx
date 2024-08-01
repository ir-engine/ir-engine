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
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { createEngine } from '@etherealengine/ecs/src/Engine'
import { getState } from '@etherealengine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { Fog, FogExp2, MathUtils, ShaderChunk } from 'three'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { EngineState } from '../../EngineState'
import { assertFloatApproxEq } from '../../physics/classes/Physics.test'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { RendererComponent } from '../WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './FogSettingsComponent'
import { FogShaders } from './FogShaders'
import { FogComponent } from './SceneComponents'

describe('FogSettingsComponent : todo.Organize', () => {
  let rootEntity: Entity
  let entity: Entity

  beforeEach(() => {
    createEngine()

    mockSpatialEngine()

    rootEntity = getState(EngineState).viewerEntity

    entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, FogSettingsComponent)
    setComponent(entity, EntityTreeComponent)

    setComponent(rootEntity, RendererComponent, { scenes: [entity] })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Create Fog Setting Component', async () => {
    const fogSettingsComponent = getMutableComponent(entity, FogSettingsComponent)
    assert(fogSettingsComponent.value, 'fog setting component exists')

    fogSettingsComponent.type.set(FogType.Height)
    fogSettingsComponent.color.set('#ff0000')
    fogSettingsComponent.far.set(2000)
    fogSettingsComponent.near.set(2)
    fogSettingsComponent.density.set(0.02)
    const { rerender, unmount } = render(<></>)

    await act(() => {
      rerender(<></>)
    })
    const fogComponent = getComponent(entity, FogComponent)
    assert(fogComponent, 'created fog component')
    assert(fogComponent.color.r == 1 && fogComponent.color.g == 0 && fogComponent.color.b == 0, 'fog set color')
    const fog = fogComponent as Fog
    assert(fog.far == 2000, 'fog set far')
    assert(fog.near == 2, 'fog set near')
    const fogExp2 = fogComponent as FogExp2
    assert(fogExp2.density == 0.02, 'fog set density')

    assert(ShaderChunk.fog_fragment == FogShaders.fog_fragment.heightFog)
    assert(ShaderChunk.fog_pars_fragment == FogShaders.fog_pars_fragment.heightFog)
    assert(ShaderChunk.fog_vertex == FogShaders.fog_vertex.heightFog)
    assert(ShaderChunk.fog_pars_vertex == FogShaders.fog_pars_vertex.heightFog)

    fogSettingsComponent.type.set(FogType.Linear)
    await act(() => {
      rerender(<></>)
    })
    assert(ShaderChunk.fog_fragment == FogShaders.fog_fragment.default)
    assert(ShaderChunk.fog_pars_fragment == FogShaders.fog_pars_fragment.default)
    assert(ShaderChunk.fog_vertex == FogShaders.fog_vertex.default)
    assert(ShaderChunk.fog_pars_vertex == FogShaders.fog_pars_vertex.default)

    fogSettingsComponent.type.set(FogType.Brownian)
    await act(() => {
      rerender(<></>)
    })
    assert(ShaderChunk.fog_fragment == FogShaders.fog_fragment.brownianMotionFog)
    assert(ShaderChunk.fog_pars_fragment == FogShaders.fog_pars_fragment.brownianMotionFog)
    assert(ShaderChunk.fog_vertex == FogShaders.fog_vertex.brownianMotionFog)
    assert(ShaderChunk.fog_pars_vertex == FogShaders.fog_pars_vertex.brownianMotionFog)
  })
})

const FogSettingsComponentDefaults = {
  type: FogType.Disabled as FogType,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}

function assertFogSettingsComponentEq(A, B): void {
  assert.equal(A.type, B.type)
  assert.equal(A.color, B.color)
  assertFloatApproxEq(A.density, B.density)
  assert.equal(A.near, B.near)
  assert.equal(A.far, B.far)
  assert.equal(A.timeScale, B.timeScale)
  assertFloatApproxEq(A.height, B.height)
}

describe('FogSettingsComponent', () => {
  describe('IDs', () => {
    it('should initialize the FogSettingsComponent.name field with the expected value', () => {
      assert.equal(FogSettingsComponent.name, 'FogSettingsComponent')
    })

    it('should initialize the FogSettingsComponent.jsonID field with the expected value', () => {
      assert.equal(FogSettingsComponent.jsonID, 'EE_fog')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FogSettingsComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, FogSettingsComponent)
      assertFogSettingsComponentEq(data, FogSettingsComponentDefaults)
    })
  }) //:: onInit

  describe('toJSON', () => {
    // it("should serialize the component's default data as expected", () => {})
  }) //:: toJSON

  describe('onSet', () => {
    // it('should change the values of an initialized FogSettingsComponent', () => {})
    // it('should not change values of an initialized FogSettingsComponent when the data passed had incorrect types', () => {})
  }) //:: onSet

  describe('reactor', () => {
    // it('should trigger when fog.type changes', () => {})
    // it('should trigger when fog.color changes', () => {})
    // it('should trigger when fog.density changes', () => {})
    // it('should trigger when fog.near changes', () => {})
    // it('should trigger when fog.far changes', () => {})
    // it('should trigger when fog.height changes', () => {})
    // it('should trigger when fog.timeScale changes', () => {})
  }) //:: reactor
})
