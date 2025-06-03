/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import '@ir-engine/engine/src/EngineModule'

import '@ir-engine/client-core/src/user/UserUISystem'
import '@ir-engine/client-core/src/world/ClientNetworkModule'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LocationService } from '@ir-engine/client-core/src/social/services/LocationService'
import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { clientContextParams } from '@ir-engine/client-core/src/util/ClientContextState'
import multiLogger from '@ir-engine/common/src/logger'
import { getMutableState, NetworkState, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'

import { ChatPageType, NewChatState } from './ChatState'
import { ContentArea } from './components/ContentArea'
import { FooterBar } from './components/FooterBar'
import { GlobalNavPane } from './components/GlobalNavPane'

import './index.css'

const logger = multiLogger.child({ component: 'ui:chat:newchat', modifier: clientContextParams })

export function ChatPage() {
  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEngineInjection()

  const chatState = useMutableState(NewChatState)

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: false,
      media: true,
      friends: true,
      instanceID: true,
      roomID: false
    })
    logger.analytics({ event_name: 'world_chat_open', event_value: '' })
    return () => logger.analytics({ event_name: 'world_chat_close', event_value: '' })
  }, [])

  const handlePageChange = (page: ChatPageType) => {
    chatState.currentPage.set(page)
  }

  return (
    <div className="pointer-events-auto flex h-screen w-full flex-col bg-[#E3E5E8]">
      <div className="flex flex-1 overflow-hidden">
        <GlobalNavPane onPageChange={handlePageChange} currentPage={chatState.currentPage.value} />
        <ContentArea currentPage={chatState.currentPage.value} />
      </div>
      <FooterBar />
    </div>
  )
}

export default ChatPage
