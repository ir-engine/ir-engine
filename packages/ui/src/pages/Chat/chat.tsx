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

import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'

import '@etherealengine/engine/src/EngineModule'

import { LocationService } from '@etherealengine/client-core/src/social/services/LocationService'
import { clientContextParams } from '@etherealengine/client-core/src/util/contextParams'
import multiLogger from '@etherealengine/common/src/logger'
import { getMutableState } from '@etherealengine/hyperflux'
import { NetworkState } from '@etherealengine/network'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

const logger = multiLogger.child({ component: 'ui:chat:chat', modifier: clientContextParams })

export const initializeEngineForChat = async () => {
  await loadEngineInjection()
}

export function ChatPage() {
  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEffect(() => {
    initializeEngineForChat()
    getMutableState(NetworkState).config.set({
      world: false,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
    logger.info({ event_name: 'world_chat_open', event_value: '' })
    return () => logger.info({ event_name: 'world_chat_close', event_value: '' })
  }, [])

  return (
    <div className="container pointer-events-auto mx-auto w-full">
      <div className="pointer flex h-[100vh] w-full bg-[#E3E5E8]">
        <ChatSection />
        <MessageContainer />
        <Media />
      </div>
    </div>
  )
}
