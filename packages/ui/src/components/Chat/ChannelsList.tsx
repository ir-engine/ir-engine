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

import React, { useEffect, useState } from 'react'

import UserIcon from './assets/icon-user.png'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { ChatService, ChatState } from '@etherealengine/client-core/src/social/services/ChatService'

export const ChannelsList = () => {
  const chatState = useHookstate(getMutableState(ChatState))

  ChatService.useAPIListeners()

  useEffect(() => {
    ChatService.getChannels()
    return () => {
    chatState.targetChannelId.set('')
    }
  }, [])

  const selectedChannelId = useHookstate('')

  useEffect(() =>{ 
    chatState.targetChannelId.set(selectedChannelId.value)
    chatState.targetObjectId.set(selectedChannelId.value)
    chatState.targetObjectType.set('user') //todo
  }, [selectedChannelId])

  const channels = (chatState.channels.value.channels ?? []).filter(channel => channel.channelType === 'user')

  const RenderChannel = (props: { channel: typeof channels[number] }) => {
    const userId = (props.channel.userId1 === Engine.instance.userId ? props.channel.userId2 : props.channel.userId1) as UserId
    const user = (props.channel.userId1 === Engine.instance.userId ? props.channel.user2 : props.channel.user1)

    const userThumbnail = useUserAvatarThumbnail() // todo

    const latestMessage = props.channel.messages.length ? props.channel.messages[props.channel.messages.length - 1]?.text : '...'

    return (
      <>
        <div
          className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-1 justify-center rounded-[5px] ${selectedChannelId.value === props.channel.id ? 'bg-[#D4D7DC]' : ''
            }`}
          onClick={() => selectedChannelId.set(props.channel.id)}
        >
          <div className="w-[230px] flex flex-wrap gap-5 justify-start">
            <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src={userThumbnail} />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">{user.name}</p>
              <p className="h-4 text-xs text-[#787589]">{latestMessage}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="w-[320px] h-[70vh] overflow-scroll hide-scroll mt-[8px]">
      <div className="w-[320px] mb-[42px] flex flex-wrap gap-[0.5px]">
        {channels.map((channel, index) => <RenderChannel channel={channel} key={index} />)}
      </div>
    </div>
  )
}
