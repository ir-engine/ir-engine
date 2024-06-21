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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  setComponent
} from '@etherealengine/ecs'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { Fog, FogExp2, MathUtils, ShaderChunk } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { createEngine } from '../../initializeEngine'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { RendererComponent } from '../WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './FogSettingsComponent'
import { FogShaders } from './FogShaders'
import { FogComponent, SceneComponent } from './SceneComponents'

describe('FogSettingsComponent', () => {
  let rootEntity: Entity
  let entity: Entity

  const mockCanvas = () => {
    return {
      getDrawingBufferSize: () => 0
    } as any as HTMLCanvasElement
  }

  beforeEach(() => {
    createEngine()

    rootEntity = createEntity()
    setComponent(rootEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, CameraComponent)
    setComponent(rootEntity, SceneComponent)
    setComponent(rootEntity, RendererComponent, { canvas: mockCanvas() })

    entity = createEntity()
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, FogSettingsComponent)
    setComponent(entity, EntityTreeComponent)

    //set data to test
    setComponent(rootEntity, SceneComponent, { children: [entity] })
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
