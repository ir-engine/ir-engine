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

import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { useFind, useGet, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useMediaNetwork } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { ChannelService, ChannelState } from '@etherealengine/client-core/src/social/services/ChannelService'
import { MediaStreamState } from '@etherealengine/client-core/src/transports/MediaStreams'
import {
  toggleMicrophonePaused,
  toggleScreenshare,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { ChannelID, ChannelType, channelPath } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import { Resizable } from 're-resizable'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { HiPhone, HiPhoneMissedCall } from 'react-icons/hi'
import { MdScreenShare, MdStopScreenShare, MdVideocam, MdVideocamOff } from 'react-icons/md'
import { ChatState } from './ChatState'
import { MediaCall } from './VideoCall'
import AttachFileIcon from './assets/attach-file2.svg'
import SendIcon from './assets/send.svg'
import UserSvg from './assets/user.svg'
/**
 * Create reactor in client-core around messages
 * reacts to chat state changes, both active channel and channel data, and fetches new messages
 */

let height = '75%'

export const getChannelName = (channel: ChannelType) => {
  return (
    channel.name ||
    channel.channelUsers
      .filter((channelUser) => channelUser.user?.id !== Engine.instance.userID)
      .map((channelUser) => channelUser.user?.name)
      .filter(Boolean)
      .join(', ')
  )
}

export const MessageList = (props: { channelID: ChannelID }) => {
  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userID)

  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: props.channelID
    }
  })

  const SelfMessage = (props: { message: (typeof messages)[0] }) => {
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
          maxWidth={780}
        >
          <div className="flex gap-1 my-5 justify-end">
            <div className="w-max-[780px] min-w-0 h-[100%] mr-5 ml-[58px] justify-end">
              <p className="rounded-xl border-[#E1E1E1] border-2 text-black bg-[#E1E1E1] p-[3px]">
                {props.message.text}
              </p>
            </div>
            <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src={userThumbnail} />
          </div>
        </Resizable>
      </>
    )
  }

  const OtherMessage = (props: { message: (typeof messages)[0] }) => {
    const userThumbnail = useUserAvatarThumbnail(props.message.sender?.id)
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
          maxWidth={600}
        >
          <div className="flex flex-wrap">
            <img className="max-w-full rounded-[38px]  w-9 h-9 object-cover" alt="" src={userThumbnail} />
            <div className="h-[20px] ml-5">
              <p className="rounded-3xl border-[#F8F8F8] border-2 text-black bg-[#F8F8F8] p-[3px]">
                {props.message.text}
              </p>
            </div>
          </div>
        </Resizable>
      </>
    )
  }

  const MessageField = () => {
    const mutateMessage = useMutation(messagePath)

    const composingMessage = useHookstate('')

    const sendMessage = () => {
      mutateMessage.create({
        text: composingMessage.value,
        channelId: props.channelID
      })
      composingMessage.set('')
    }

    return (
      <div className="relative w-full bottom-0 h-[70px]  gap-5 flex flex-wrap justify-center bg-[#ffffff]">
        <button className="">
          <img className="w-[30px] rounded-full font-bold h-[30px] overflow-hidden" alt="" src={AttachFileIcon} />
        </button>
        <div className="mt-3 rounded-3xl bg-[#d7d7d7] w-[80%] h-[45px] flex flex-wrap">
          <div className="rounded-full ml-4 my-2 bg-white w-[30px] h-[30px] justify-between">
            <img className="max-w-full w-[13.64px] mx-2 h-[28.64px] overflow-hidden" alt="" src={UserSvg} />
          </div>
          <div className="w-[525px] h-[30px] ml-1 mt-[2.5px]">
            <input
              type="text"
              className="m-0 rounded-3xl focus:outline-none focus:border-[#d7d7d7] border-[#d7d7d7] border-2 text-black bg-[#d7d7d7] p-2 w-full "
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
      <div
        className="w-full bg-[#FFFFFF] ml-8  mt-4 justify-center content-center overflow-scroll hide-scroll"
        style={{ height: height }}
      >
        {messages.map((message, index) => {
          if (message.sender?.id === Engine.instance.userID) return <SelfMessage key={index} message={message} />
          else return <OtherMessage key={index} message={message} />
        })}
      </div>
      <MessageField />
    </>
  )
}

const MessageHeader = (props: { selectedChannelID: ChannelID }) => {
  const { selectedChannelID } = props

  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId).value
  const { data: channel } = useGet(channelPath, selectedChannelID!)

  const channelName = channel ? getChannelName(channel) : ''
  console.log(selectedChannelID, channel, channelName)

  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const isCamVideoEnabled = mediaStreamState.camVideoProducer.value != null && !mediaStreamState.videoPaused.value
  const isCamAudioEnabled = mediaStreamState.camAudioProducer.value != null && !mediaStreamState.audioPaused.value
  const isScreenVideoEnabled =
    mediaStreamState.screenVideoProducer.value != null && !mediaStreamState.screenShareVideoPaused.value

  const startMediaCall = () => {
    if (!selectedChannelID) return
    const inChannelCall = targetChannelId === selectedChannelID
    ChannelService.joinChannelInstance(inChannelCall ? ('' as ChannelID) : selectedChannelID)
  }

  useEffect(() => {
    ChannelService.getChannels()
  }, [])

  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = Engine.instance.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.connected.value
  const connecting = mediaNetworkID && !mediaNetworkState?.connected?.value

  return (
    <>
      <div className="ml-8">
        <p className="text-2xl min-w-0 max-w-xs font-bold text-[#3F3960]">{channelName}</p>
      </div>
      <div className="flex gap-6 justify-end mr-5">
        {connecting && <p className="mt-6 pt-2 flex flex-wrap text-[#3F3960]">Connecting...</p>}
        {mediaConnected && (
          <>
            <button
              className="m-0 w-[38px] h-[38px] flex flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
              onClick={toggleWebcamPaused}
            >
              {isCamVideoEnabled ? (
                <MdVideocam className="w-5 h-5 overflow-hidden mt-2 fill-[#ff1515]" />
              ) : (
                <MdVideocamOff className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]" />
              )}
            </button>
            <button
              className="m-0 w-[38px] h-[38px] flex flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
              onClick={toggleMicrophonePaused}
            >
              {isCamAudioEnabled ? (
                <FaMicrophone className="w-5 h-5 overflow-hidden mt-2 fill-[#ff1515]" />
              ) : (
                <FaMicrophoneSlash className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]" />
              )}
            </button>
            <button
              className="m-0 w-[38px] h-[38px] flex flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
              onClick={toggleScreenshare}
            >
              {isScreenVideoEnabled ? (
                <MdScreenShare className="w-6 h-6 overflow-hidden mt-2 fill-[#ff1515]" />
              ) : (
                <MdStopScreenShare className="w-6 h-6 overflow-hidden mt-2 fill-[#3F3960]" />
              )}
            </button>
          </>
        )}
        <button
          className="m-0 w-[38px] h-[38px] flex flex-wrap justify-center rounded-[5px] bg-[#EDEEF0]"
          onClick={() => {
            startMediaCall()
          }}
        >
          {targetChannelId && targetChannelId === selectedChannelID ? (
            <HiPhoneMissedCall
              className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]"
              onClick={() => {
                height = '75%'
              }}
            />
          ) : (
            <HiPhone
              className="w-5 h-5 overflow-hidden mt-2 fill-[#3F3960]"
              onClick={() => {
                height = '54%'
              }}
            />
          )}
        </button>
      </div>
    </>
  )
}

export const MessageContainer = () => {
  const selectedChannelID = useHookstate(getMutableState(ChatState).selectedChannelID).value

  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = Engine.instance.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.connected.value

  return (
    <>
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
        minWidth={560}
        maxWidth={830}
      >
        <div className=" h-[100vh] bg-white">
          <div className="w-full h-[90px] flex flex-wrap flex-col justify-center">
            {selectedChannelID && <MessageHeader selectedChannelID={selectedChannelID!} />}
          </div>
          <Resizable
            bounds="parent"
            defaultSize={{ width: '100%', height: '100%' }}
            enable={{
              top: false,
              right: false,
              bottom: true,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
            maxHeight={'100%'}
          >
            {mediaConnected && (
              <>
                <div className="w-full justify-center content-center overflow-x-scroll hide-scroll">
                  <MediaCall />
                </div>
              </>
            )}
            <div className="box-border w-full border-t-[1px] border-solid border-[#D1D3D7]" />
            {selectedChannelID && <MessageList channelID={selectedChannelID} />}
          </Resizable>
        </div>
      </Resizable>
    </>
  )
}
