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

import React, { useEffect } from 'react'

import { ChatSection } from '@etherealengine/ui/src/components/Chat/ChatSection'
import { Media } from '@etherealengine/ui/src/components/Chat/Media'
import { MessageContainer } from '@etherealengine/ui/src/components/Chat/Message'

import './index.css'

import { ClientNetworkingSystem } from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { MediaSystem } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystem, startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { projectsPath } from '@etherealengine/engine/src/schemas/projects/projects.schema'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

const startChatSystems = () => {
  startSystem(MediaSystem, { before: PresentationSystemGroup })
  startSystems([ClientNetworkingSystem], { after: PresentationSystemGroup })
}

export const initializeEngineForChat = async () => {
  if (getMutableState(EngineState).isEngineInitialized.value) return

  const projects = Engine.instance.api.service(projectsPath).find()

  startChatSystems()
  await loadEngineInjection((await projects).projectsList)

  dispatchAction(EngineActions.initializeEngine({ initialised: true }))
  dispatchAction(EngineActions.sceneLoaded({}))
}

export function ChatPage() {
  AuthService.useAPIListeners()

  useEffect(() => {
    initializeEngineForChat()
    getMutableState(NetworkState).config.set({
      world: false,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
  }, [])

  return (
    <div className="w-full container mx-auto pointer-events-auto">
      <div className="w-full h-[100vh] flex bg-[#E3E5E8] pointer">
        <ChatSection />
        <MessageContainer />
        <Media />
      </div>
    </div>
  )
}
