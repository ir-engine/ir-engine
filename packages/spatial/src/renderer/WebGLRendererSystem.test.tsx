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
  SystemDefinitions,
  UUIDComponent,
  createEntity,
  destroyEngine,
  setComponent
} from '@etherealengine/ecs'
import { Color, MathUtils } from 'three'
import { CameraComponent } from '../camera/components/CameraComponent'
import { createEngine } from '../initializeEngine'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { RendererComponent, WebGLRendererSystem, getSceneParameters } from './WebGLRendererSystem'
import { FogSettingsComponent, FogType } from './components/FogSettingsComponent'
import { BackgroundComponent, EnvironmentMapComponent, SceneComponent } from './components/SceneComponents'

describe('FogSettingsComponent', () => {
  let rootEntity: Entity

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
    setComponent(rootEntity, BackgroundComponent, new Color(0x000000))

    setComponent(rootEntity, EnvironmentMapComponent)
    setComponent(rootEntity, FogSettingsComponent, { type: FogType.Height })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('test', async () => {
    const { background, environment, fog, children } = getSceneParameters([rootEntity])
    SystemDefinitions.get(WebGLRendererSystem)?.execute()
    globalThis._scene
    console.log('test')
    //assert(fogSettingsComponent.value, 'fog setting component exists')
  })
})
