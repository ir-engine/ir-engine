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

import { ChannelService, ChannelState } from '@etherealengine/client-core/src/social/services/ChannelService'
import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { DrawerCreateChannel } from './DrawerCreateChannel'

export const ChannelsList = () => {
  const chatState = useHookstate(getMutableState(ChannelState))

  ChannelService.useAPIListeners()

  useEffect(() => {
    ChannelService.getChannels()
    return () => {
      chatState.targetChannelId.set('' as ChannelID)
    }
  }, [])

  const isDrawerOpen = useHookstate(false)
  const selectedChannelId = useHookstate('' as ChannelID)

  useEffect(() => {
    chatState.targetChannelId.set(selectedChannelId.value)
  }, [selectedChannelId])

  const channels = chatState.channels.value.channels ?? []

  const RenderChannel = (props: { channel: (typeof channels)[number] }) => {
    const userThumbnail = useUserAvatarThumbnail() // todo
    const latestMessage = props.channel.messages.length
      ? props.channel.messages[props.channel.messages.length - 1]?.text
      : '...'

    return (
      <>
        <div
          className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-1 justify-center rounded-[5px] ${
            selectedChannelId.value === props.channel.id ? 'bg-[#D4D7DC]' : ''
          }`}
          onClick={() => selectedChannelId.set(props.channel.id)}
        >
          <div className="w-[230px] flex flex-wrap gap-5 justify-start">
            <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src={userThumbnail} />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">{props.channel.ownerId}</p>
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
        <div className="w-[330px] flex justify-center items-center">
          <button
            className="cursor-pointer rounded-[20px] p-0 bg-[#3F3960] w-[120px] h-8"
            onClick={() => isDrawerOpen.set(true)}
          >
            <div className="[text-align-last:center] rounded-2xl text-[16px] text-sm font-segoe-ui text-white text-left">
              CREATE CHANNEL
            </div>
          </button>
          {isDrawerOpen.value && (
            <div className="fixed inset-0 flex z-50">
              <div className="bg-gray-500 bg-opacity-50 flex-1" onClick={() => isDrawerOpen.set(false)}></div>
              <DrawerCreateChannel />
            </div>
          )}
        </div>
        {channels.map((channel, index) => (
          <RenderChannel channel={channel} key={index} />
        ))}
      </div>
    </div>
  )
}
