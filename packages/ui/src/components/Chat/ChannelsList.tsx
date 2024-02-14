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

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'
import UserIcon from './assets/user.svg'

import { ChannelID, channelPath, messagePath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { Resizable } from 're-resizable'
import { ChatState } from './ChatState'
import { DrawerCreateChannel } from './DrawerCreateChannel'
import { getChannelName } from './Message'

export const ChannelsList = () => {
  const chatState = useHookstate(getMutableState(ChatState))

  const channelsList = useFind(channelPath)
  console.log(channelsList)

  useEffect(() => {
    return () => {
      chatState.selectedChannelID.set('' as ChannelID)
    }
  }, [])

  const isDrawerOpen = useHookstate(false)
  const selectedChannelId = useHookstate('' as ChannelID)

  useEffect(() => {
    chatState.selectedChannelID.set(selectedChannelId.value)
  }, [selectedChannelId])

  const channels = channelsList.data

  const RenderChannel = (props: { channel: (typeof channels)[number] }) => {
    // const userThumbnail = useUserAvatarThumbnail() // todo

    const { data: messages } = useFind(messagePath, {
      query: {
        channelId: props.channel.id
      }
    })

    const latestMessage = messages.length ? messages[messages.length - 1]?.text : '...'

    return (
      <>
        <Resizable
          bounds="parent"
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          minWidth={260}
          maxWidth={390}
        >
          <div
            className={` mx-4 flex h-[68px]	flex-nowrap justify-center gap-1 rounded-[5px] ${
              selectedChannelId.value === props.channel.id ? 'bg-[#D4D7DC]' : ''
            }`}
            onClick={() => selectedChannelId.set(props.channel.id)}
          >
            <img
              className="rounded-8xs ml-5 mt-3 h-11 w-11 max-w-full object-cover"
              alt=""
              src={UserIcon /**userThumbnail */}
            />
            <div className="mt-3 w-[200px] justify-start overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="font-bold text-[#3F3960]">{getChannelName(props.channel)}</p>
              <p className="h-4 text-xs text-[#787589]">{latestMessage}</p>
            </div>
          </div>
        </Resizable>
      </>
    )
  }

  return (
    <>
      <div className="flex h-[10vh] w-full items-center justify-center">
        <button
          className="m-0 h-8 w-[120px] cursor-pointer rounded-[20px] bg-[#3F3960] p-0"
          onClick={() => isDrawerOpen.set(true)}
        >
          <div className="font-segoe-ui rounded-2xl text-left text-[16px] text-sm text-white [text-align-last:center]">
            CREATE CHANNEL
          </div>
        </button>
        {isDrawerOpen.value && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-gray-500 bg-opacity-50" onClick={() => isDrawerOpen.set(false)}></div>
            <DrawerCreateChannel />
          </div>
        )}
      </div>
      {channels.map((channel) => (
        <RenderChannel channel={channel} key={channel.id} />
      ))}
    </>
  )
}
