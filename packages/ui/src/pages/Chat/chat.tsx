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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'

import { ChatSection } from '@ir-engine/ui/src/components/Chat/ChatSection'
import { Media } from '@ir-engine/ui/src/components/Chat/Media'
import { MessageContainer } from '@ir-engine/ui/src/components/Chat/Message'

import './index.css'

import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'

import '@ir-engine/engine/src/EngineModule'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LocationService } from '@ir-engine/client-core/src/social/services/LocationService'
import { clientContextParams } from '@ir-engine/client-core/src/util/ClientContextState'
import multiLogger from '@ir-engine/common/src/logger'
import { getMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

const logger = multiLogger.child({ component: 'ui:chat:chat', modifier: clientContextParams })

export function ChatPage() {
  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEngineInjection()

  useEffect(() => {
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
