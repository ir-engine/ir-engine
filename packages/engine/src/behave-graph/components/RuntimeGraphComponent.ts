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

import { getState } from '@etherealengine/hyperflux'
import { defineComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Engine, readGraphFromJSON } from '../nodes'
import { DefaultLogger } from '../nodes/Profiles/Core/Abstractions/Drivers/DefaultLogger'
import { ManualLifecycleEventEmitter } from '../nodes/Profiles/Core/Abstractions/Drivers/ManualLifecycleEventEmitter'
import { registerCoreProfile } from '../nodes/Profiles/Core/registerCoreProfile'
import { registerEngineProfile } from '../nodes/Profiles/Engine/registerEngineProfile'
import { DummyScene } from '../nodes/Profiles/Scene/Abstractions/Drivers/DummyScene'
import { registerSceneProfile } from '../nodes/Profiles/Scene/registerSceneProfile'
import { BehaveGraphSystemState } from '../systems/BehaveGraphSystem'
import { BehaveGraphComponent } from './BehaveGraphComponent'

export const RuntimeGraphComponent = defineComponent({
  name: 'EE_runtimeGraph',

  onInit: (entity) => {
    const graphComponent = getComponent(entity, BehaveGraphComponent)
    const logger = new DefaultLogger()
    const ticker = new ManualLifecycleEventEmitter()
    const scene = new DummyScene()
    const registry = registerEngineProfile(
      registerSceneProfile(
        registerCoreProfile({
          values: {},
          nodes: {},
          dependencies: {
            ILogger: logger,
            ILifecycleEventEmitter: ticker,
            IScene: scene
          }
        })
      )
    )
    const systemState = getState(BehaveGraphSystemState)
    systemState.domains[graphComponent.domain]?.register(registry, logger, ticker, scene)
    const graph = graphComponent.graph
    const graphNodes = readGraphFromJSON({ graphJson: graph, registry }).nodes
    const engine = new Engine(graphNodes)
    return { engine, ticker }
  },

  onRemove: (entity, component) => {
    component.value.engine.dispose()
  }
})
