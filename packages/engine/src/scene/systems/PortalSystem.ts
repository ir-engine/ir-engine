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

import { useEffect } from 'react'

import { defineActionQueue, getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PortalComponent } from '../components/PortalComponent'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'
import { HyperspacePortalSystem } from './HyperspacePortalSystem'
import { PortalLoadSystem } from './PortalLoadSystem'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

const sceneLoadedQueue = defineActionQueue(EngineActions.sceneLoaded.matches)

const execute = () => {
  if (sceneLoadedQueue().length && getState(EngineState).isTeleporting) revertAvatarToMovingStateFromTeleport()
}

const reactor = () => {
  useEffect(() => {
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.portal, [
      ...defaultSpatialComponents,
      { name: PortalComponent.jsonID }
    ])

    return () => {
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.portal)
    }
  }, [])
  return null
}

export const PortalSystem = defineSystem({
  uuid: 'ee.engine.PortalSystem',
  execute,
  reactor,
  subSystems: [PortalLoadSystem, HyperspacePortalSystem]
})
