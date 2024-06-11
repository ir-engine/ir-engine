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
  Engine,
  Entity,
  EntityUUID,
  SystemDefinitions,
  UUIDComponent,
  destroyEngine,
  getComponent,
  getMutableComponent,
  setComponent
} from '@etherealengine/ecs'
import { getMutableState } from '@etherealengine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import { EffectComposer, RenderPass } from 'postprocessing'
import React from 'react'
import { Color, MathUtils } from 'three'
import { MockEngineRenderer } from '../../tests/util/MockEngineRenderer'
import { CameraComponent } from '../camera/components/CameraComponent'
import { createEngine } from '../initializeEngine'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { PerformanceState } from './PerformanceState'
import { RendererState } from './RendererState'
import { RendererComponent, WebGLRendererSystem } from './WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './components/FogSettingsComponent'
import { BackgroundComponent, EnvironmentMapComponent, SceneComponent } from './components/SceneComponents'
import { RenderModes } from './constants/RenderModes'

describe('WebGl Renderer System', () => {
  let rootEntity: Entity
  let entity: Entity

  const mockCanvas = () => {
    return {
      getDrawingBufferSize: () => 0,
      getContext: () => {}
    } as any as HTMLCanvasElement
  }

  beforeEach(() => {
    createEngine()

    rootEntity = Engine.instance.viewerEntity //createEntity()
    setComponent(rootEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, CameraComponent)
    setComponent(rootEntity, SceneComponent)
    setComponent(rootEntity, RendererComponent, { canvas: mockCanvas() })
    getMutableComponent(rootEntity, RendererComponent).set(new MockEngineRenderer())
    const rendererComp = getMutableComponent(rootEntity, RendererComponent)
    rendererComp.canvas.set(mockCanvas())
    setComponent(rootEntity, BackgroundComponent, new Color(0x000000))

    setComponent(rootEntity, EnvironmentMapComponent)
    setComponent(rootEntity, FogSettingsComponent, { type: FogType.Height })

    //entity = createEntity()
    //setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    //getMutableState(RendererState).usePostProcessing.set(true)
    //setComponent(entity, PostProcessingComponent, { enabled: true })
    //setComponent(entity, EntityTreeComponent)

    //set data to test
    //setComponent(rootEntity, SceneComponent, { children: [entity] })

    //override addpass to test data without dependency on Browser
    let addPassCount = 0
    EffectComposer.prototype.addPass = () => {
      addPassCount++
    }
  })

  afterEach(() => {
    return destroyEngine()
  })

  /*
  it('test', async () => {
    const { background, environment, fog, children } = getSceneParameters([rootEntity])
    SystemDefinitions.get(WebGLRendererSystem)?.execute()
    globalThis._scene
    console.log('test')
    //assert(fogSettingsComponent.value, 'fog setting component exists')
  })
  */

  it('Test WebGL Reactors', async () => {
    const rendererComponent = getComponent(Engine.instance.viewerEntity, RendererComponent)
    const RenderSystem = SystemDefinitions.get(WebGLRendererSystem)?.reactor!
    const tag = <RenderSystem />
    const { rerender, unmount } = render(tag)

    SystemDefinitions.get(WebGLRendererSystem)?.execute()

    const engineRendererSettings = getMutableState(RendererState)
    engineRendererSettings.renderMode.set(RenderModes.WIREFRAME)
    engineRendererSettings.renderScale.set(2)
    engineRendererSettings.qualityLevel.set(3)
    engineRendererSettings.automatic.set(false)

    await act(() => rerender(tag))

    const rendererComp = getComponent(rootEntity, RendererComponent)
    const effectComposer = rendererComp.effectComposer
    const passes = effectComposer?.passes.filter((p) => p.name === 'RenderPass') as any
    const renderPass: RenderPass = passes ? passes[0] : undefined

    const performanceState = getMutableState(PerformanceState)

    assert(renderPass.overrideMaterial, 'change render mode')
    assert(rendererComp.needsResize, 'change render scale')
    assert(performanceState.cpuTier.value == 3, 'change quality level')
  })
})
