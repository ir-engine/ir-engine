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

import {
  ECSState,
  Entity,
  EntityUUID,
  SystemDefinitions,
  Timer,
  UUIDComponent,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getMutableState } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { Color, Group, MathUtils, Texture } from 'three'
import { mockEngineRenderer } from '../../tests/util/MockEngineRenderer'
import { EngineState } from '../EngineState'
import { CameraComponent } from '../camera/components/CameraComponent'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { RendererState } from './RendererState'
import {
  RendererComponent,
  WebGLRendererSystem,
  getNestedVisibleChildren,
  getSceneParameters
} from './WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './components/FogSettingsComponent'
import { GroupComponent, addObjectToGroup } from './components/GroupComponent'
import { Object3DComponent } from './components/Object3DComponent'
import { BackgroundComponent, EnvironmentMapComponent, SceneComponent } from './components/SceneComponents'
import { VisibleComponent } from './components/VisibleComponent'
import { ObjectLayers } from './constants/ObjectLayers'
import { RenderModes } from './constants/RenderModes'

describe('WebGl Renderer System', () => {
  let rootEntity: Entity
  let visibleEntity: Entity
  let invisibleEntity: Entity
  let nestedVisibleEntity: Entity
  let nestedInvisibleEntity: Entity

  beforeEach(() => {
    createEngine()
    const timer = Timer((time, xrFrame) => {})
    getMutableState(ECSState).timer.set(timer)

    rootEntity = createEntity()
    getMutableState(EngineState).viewerEntity.set(rootEntity)
    setComponent(rootEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, CameraComponent)
    mockEngineRenderer(rootEntity)
    setComponent(rootEntity, BackgroundComponent, new Color(0xffffff))

    setComponent(rootEntity, EnvironmentMapComponent, new Texture())
    setComponent(rootEntity, FogSettingsComponent, { type: FogType.Height })

    invisibleEntity = createEntity()
    setComponent(invisibleEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(invisibleEntity, GroupComponent)
    const invisibleObject3d = setComponent(invisibleEntity, Object3DComponent, new Group())
    addObjectToGroup(invisibleEntity, invisibleObject3d)
    setComponent(invisibleEntity, EntityTreeComponent)

    visibleEntity = createEntity()
    setComponent(visibleEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(visibleEntity, VisibleComponent)
    const visibleObject3d = setComponent(visibleEntity, Object3DComponent, new Group())
    addObjectToGroup(visibleEntity, visibleObject3d)
    setComponent(visibleEntity, GroupComponent)
    setComponent(visibleEntity, EntityTreeComponent)
    setComponent(rootEntity, SceneComponent)

    nestedInvisibleEntity = createEntity()
    setComponent(nestedInvisibleEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(nestedInvisibleEntity, GroupComponent)
    const nestedInvisibleObject3d = setComponent(nestedInvisibleEntity, Object3DComponent, new Group())
    addObjectToGroup(nestedInvisibleEntity, nestedInvisibleObject3d)
    setComponent(nestedInvisibleEntity, EntityTreeComponent)
    setComponent(visibleEntity, SceneComponent)

    nestedVisibleEntity = createEntity()
    setComponent(nestedVisibleEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(nestedVisibleEntity, VisibleComponent)
    const nestedVisibleObject3d = setComponent(nestedVisibleEntity, Object3DComponent, new Group())
    addObjectToGroup(nestedVisibleEntity, nestedVisibleObject3d)
    setComponent(nestedVisibleEntity, GroupComponent)
    setComponent(nestedVisibleEntity, EntityTreeComponent)
    setComponent(invisibleEntity, SceneComponent)

    setComponent(rootEntity, RendererComponent, { scenes: [visibleEntity, invisibleEntity] })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Test Background, Environment, Fog Components', async () => {
    const { background, environment, fog, children } = getSceneParameters([rootEntity])
    SystemDefinitions.get(WebGLRendererSystem)?.execute()
    assert(background, 'background component exists')
    const backgroundColor = background as Color
    assert(
      backgroundColor.r == 1 && backgroundColor.g == 1 && backgroundColor.b == 1,
      'backgroud color was set correctly'
    )

    assert(environment, 'environment component exists')
    assert(fog, 'fog component exists')
  })

  it('Test WebGL Reactors', async () => {
    const webGLRendererSystem = SystemDefinitions.get(WebGLRendererSystem)!
    const RenderSystem = webGLRendererSystem.reactor!
    const tag = <RenderSystem />
    const { rerender, unmount } = render(tag)

    SystemDefinitions.get(WebGLRendererSystem)?.execute()

    const engineRendererSettings = getMutableState(RendererState)
    engineRendererSettings.renderMode.set(RenderModes.WIREFRAME)
    engineRendererSettings.renderScale.set(2)
    engineRendererSettings.qualityLevel.set(3)
    engineRendererSettings.automatic.set(false)
    engineRendererSettings.physicsDebug.set(true)
    engineRendererSettings.avatarDebug.set(true)
    engineRendererSettings.gridVisibility.set(true)
    engineRendererSettings.nodeHelperVisibility.set(true)

    await act(() => rerender(tag))

    const camera = getComponent(rootEntity, CameraComponent)
    const rendererComp = getComponent(rootEntity, RendererComponent)
    /** @todo we never add a PostProcessing component, so why are these tests expecting an effect composer? */
    // const effectComposer = rendererComp.effectComposer
    // const passes = effectComposer?.passes.filter((p) => p.name === 'RenderPass') as any
    // const renderPass: RenderPass = passes ? passes[0] : undefined

    // assert(renderPass.overrideMaterial, 'change render mode')
    assert(rendererComp.needsResize, 'change render scale')
    assert(camera.layers.isEnabled(ObjectLayers.PhysicsHelper), 'enable physicsDebug')
    assert(camera.layers.isEnabled(ObjectLayers.AvatarHelper), 'enable avatarDebug')
    assert(camera.layers.isEnabled(ObjectLayers.Gizmos), 'enable gridVisibility')
    assert(camera.layers.isEnabled(ObjectLayers.NodeHelper), 'enable nodeHelperVisibility')

    webGLRendererSystem?.execute()

    assert(!rendererComp.needsResize, 'resize updated')
    const scenes = getComponent(rootEntity, RendererComponent).scenes
    const entitiesToRender = scenes.map(getNestedVisibleChildren).flat()
    assert(entitiesToRender.length == 1 && entitiesToRender[0] == visibleEntity, 'visible children')
  })
})
