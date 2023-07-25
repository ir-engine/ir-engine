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

import React from 'react'

import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { ChannelService } from '@etherealengine/client-core/src/social/services/ChannelService'
import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { Resizable } from 're-resizable'
import { FaMicrophone } from 'react-icons/fa'
import { HiPhoneMissedCall } from 'react-icons/hi'
import { IoMdVideocam } from 'react-icons/io'
import { MdScreenShare } from 'react-icons/md'
import { ChatState } from './ChatState'
import { VideoCall } from './VideoCall'
import AttachFileIcon from './assets/attach-file2.svg'
import SendIcon from './assets/send.svg'
import UserSvg from './assets/user.svg'
/**
 * Create reactor in client-core around messages
 * reacts to chat state changes, both active channel and channel data, and fetches new messages
 */

export const MessageList = (props: { channelID: ChannelID }) => {
  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userId)

  const { data: messages } = useFind('message', {
    query: {
      channelId: props.channelID
    }
  })

  const startMediaCall = () => {
    ChannelService.joinChannelInstance(props.channelID)
  }

  const SelfMessage = (props: { message: (typeof messages)[0] }) => {
    return (
      <div className="flex flex-wrap mt-6 ">
        <div className="h-[20px] mx-[147px] mr-5">
          <p className="rounded-xl border-[#E1E1E1] border-2 text-black bg-[#E1E1E1] p-[3px]">{props.message.text}</p>
        </div>
        <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src={userThumbnail} />
      </div>
    )
  }

  const OtherMessage = (props: { message: (typeof messages)[0] }) => {
    const userThumbnail = useUserAvatarThumbnail(props.message.sender?.id)
    return (
      <div className="flex flex-wrap">
        <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src={userThumbnail} />
        <div className="h-[20px] ml-5">
          <p className="rounded-3xl border-[#F8F8F8] border-2 text-black bg-[#F8F8F8] p-[3px]">{props.message.text}</p>
        </div>
      </div>
    )
  }

  const MessageField = () => {
    const mutateMessage = useMutation('message')

    const composingMessage = useHookstate('')

    const sendMessage = () => {
      mutateMessage.create({
        text: composingMessage.value,
        channelId: props.channelID
      })
      composingMessage.set('')
    }

    return (
      <div className="absolute w-full bottom-0 h-[70px]  gap-5 flex flex-wrap justify-center bg-[#ffffff]">
        <button className="">
          <img className="w-[30px] rounded-full font-bold h-[30px] overflow-hidden" alt="" src={AttachFileIcon} />
        </button>
        <div className="mt-3 rounded-3xl bg-[#d7d7d7] w-[580px] h-[45px] flex flex-wrap">
          <div className="rounded-full ml-4 my-2 bg-white w-[30px] h-[30px] justify-between">
            <img className="w-[13.64px] mx-2 h-[28.64px] overflow-hidden" alt="" src={UserSvg} />
          </div>
          <div className="w-[525px] h-[30px] ml-1 mt-[2.5px]">
            <input
              type="text"
              className="rounded-3xl focus:outline-none focus:border-[#d7d7d7] border-[#d7d7d7] border-2 text-black bg-[#d7d7d7] p-2 w-full "
              value={composingMessage.value}
              onChange={(e) => composingMessage.set(e.target.value)}
            />
          </div>
        </div>
        <button className="" onClick={sendMessage}>
          <img className="w-[30px] h-[30px]" alt="" src={SendIcon} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="w-full bg-[#FFFFFF] ml-6 mb-[100px] mt-4 justify-center content-center overflow-scroll hide-scroll">
        {messages.map((message, index) => {
          if (message.sender?.id === Engine.instance.userId) return <SelfMessage key={index} message={message} />
          else return <OtherMessage key={index} message={message} />
        })}
      </div>
      <MessageField />
    </>
  )
}

export const MessageContainer = () => {
  const selectedChannelID = useHookstate(getMutableState(ChatState).selectedChannelID).value

  // const userName = useHookstate(getMutableState(AuthState).user.name).value
  // const channelsList = useFind('channel', {})
  // const channelUserNames = channelsList?.channel_users.map((user) => user.user!.name).filter((name) => name !== userName) ?? []
  const channelUserNames = []
  return (
    <>
      {' '}
      <Resizable
        bounds="window"
        defaultSize={{ width: 780, height: '100%' }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        minWidth={600}
        maxWidth={850}
      >
        <div className="w-full h-[100vh] bg-white">
          <div className="w-full h-[90px] flex flex-wrap gap-[450px] justify-center">
            <div className="mt-7">
              <p className="text-3xl font-bold text-[#3F3960]">{channelUserNames.join(', ')}</p>
            </div>
            <div className="flex gap-6 justify-center">
              <button className="w-[38px] h-[38px] flex flex-wrap mt-6 justify-center rounded-[5px] bg-[#EDEEF0]">
                <IoMdVideocam className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]" />
              </button>
              <button className="w-[38px] h-[38px] flex flex-wrap mt-6 justify-center rounded-[5px] bg-[#EDEEF0]">
                <FaMicrophone className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]" />
              </button>
              <button className="w-[38px] h-[38px] flex flex-wrap mt-6 justify-center rounded-[5px] bg-[#EDEEF0]">
                <MdScreenShare className="w-6 h-6 overflow-hidden mt-2 fill-[#3F3960]" />
              </button>
              {/* <button className="">
            <img className="w-10 h-10 overflow-hidden" alt="" src={CallIcon} />
          </button> */}
              <button className="w-[38px] h-[38px] flex flex-wrap mt-6 justify-center rounded-[5px] bg-[#EDEEF0]">
                <HiPhoneMissedCall className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]" />
              </button>
            </div>
          </div>

          <div className="box-border w-full border-t-[1px] border-solid border-[#D1D3D7]" />
          <div className="w-full h-[400vh]">
            <VideoCall />
          </div>
          {<MessageList channelID={selectedChannelID!} />}
        </div>
      </Resizable>
    </>
  )
}
