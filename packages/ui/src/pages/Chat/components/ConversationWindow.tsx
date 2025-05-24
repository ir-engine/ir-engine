/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https:
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

import { useMediaNetwork } from '@ir-engine/client-core/src/common/services/MediaInstanceConnectionService'
import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { ChannelState } from '@ir-engine/client-core/src/social/services/ChannelService'
import { useFind, useGet, useMutation } from '@ir-engine/common'
import {
  ChannelID,
  channelPath,
  instanceAttendancePath,
  instancePath,
  messagePath,
  UserID,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { EngineState } from '@ir-engine/ecs/src/EngineState'
import {
  getMutableState,
  getState,
  MediaStreamState,
  NetworkState,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { Expand06Lg, Maximize02Lg, Screenshare } from '@ir-engine/ui/src/icons'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef } from 'react'
import { HiPaperClip, HiPhone, HiVideoCamera } from 'react-icons/hi'
import { HiPaperAirplane } from 'react-icons/hi2'
import { MdOpenInNew } from 'react-icons/md'
import { NewChatState } from '../ChatState'
import { MediaSessionState } from '../MediaSessionState'
import { formatMessageTimestamp } from '../utils/dateUtils'
import { getChannelName } from './ConversationList'
import { MediaCall } from './VideoCall'

const useCallParticipants = (channelId?: ChannelID) => {
  const participants = useHookstate<{ userId: UserID; peerId: string }[]>([])

  const lastPoll = useHookstate(new Date(new Date().getTime() - 10000))

  const instanceData = useFind(instancePath, {
    query: {
      channelId: channelId,
      ended: false,
      $limit: 1,
      $sort: { createdAt: -1 }
    }
  })

  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: {
      instanceId: instanceData.data[0]?.id,
      ended: false,
      updatedAt: {
        $gt: toDateTimeSql(lastPoll.value)
      }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      lastPoll.set(new Date(new Date().getTime() - 10000))
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!channelId || !instanceAttendanceQuery.data) {
      participants.set([])
      return
    }

    if (instanceAttendanceQuery.data.length > 0) {
      const uniqueUsers = instanceAttendanceQuery.data.reduce(
        (acc: { userId: UserID; peerId: string }[], attendance: any) => {
          if (!acc.some((user) => user.userId === attendance.userId)) {
            acc.push({ userId: attendance.userId, peerId: attendance.peerId })
          }
          return acc
        },
        []
      )

      participants.set(uniqueUsers)
    } else {
      participants.set([])
    }
  }, [channelId, instanceAttendanceQuery.status])

  return participants.value
}

const CallParticipants: React.FC<{ channelId: ChannelID }> = ({ channelId }) => {
  const participants = useCallParticipants(channelId)

  if (participants.length === 0) return null

  return (
    <div className="flex items-center space-x-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
      <span className="text-sm font-medium text-gray-700">In call:</span>
      <div className="flex -space-x-2 overflow-hidden">
        {participants.map((participant) => (
          <CallParticipantAvatar key={participant.userId} userId={participant.userId} />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {participants.length} {participants.length === 1 ? 'user' : 'users'}
      </span>
    </div>
  )
}

const CallParticipantAvatar: React.FC<{ userId: UserID }> = ({ userId }) => {
  const avatarThumbnail = useUserAvatarThumbnail(userId)
  const { data: user } = useGet(userPath, userId)

  return (
    <div className="relative inline-block">
      <img
        src={avatarThumbnail}
        alt={user?.name || 'User'}
        title={user?.name || 'User'}
        className="h-8 w-8 rounded-full border-2 border-white object-cover"
      />
    </div>
  )
}

export const ConversationWindow: React.FC = () => {
  const chatState = useMutableState(NewChatState)
  const mediaSessionState = useMutableState(MediaSessionState)
  const selectedChannelID = chatState.selectedChannelID.value
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const videoHeight = useHookstate(() => {
    const savedHeight = localStorage.getItem('videoContainerHeight')
    return savedHeight ? parseInt(savedHeight, 10) : 300
  })

  const messageLimit = useHookstate(20)
  const isLoadingMore = useHookstate(false)
  const hasMoreMessages = useHookstate(true)
  const scrollPosition = useHookstate(0)

  const { data: channel } = useGet(channelPath, selectedChannelID!)
  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: selectedChannelID,
      $limit: messageLimit.value,
      $sort: { createdAt: 1 }
    }
  })

  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId).value
  const mediaNetworkState = useMediaNetwork()
  const mediaNetworkID = NetworkState.mediaNetwork?.id
  const mediaConnected = mediaNetworkID && mediaNetworkState?.ready.value

  const isUserScrolled = useHookstate(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10

    isUserScrolled.set(!isScrolledToBottom)

    scrollPosition.set(scrollTop)

    if (scrollTop < 50 && !isLoadingMore.value && hasMoreMessages.value && messages.length >= messageLimit.value) {
      loadMoreMessages()
    }
  }

  const loadMoreMessages = () => {
    if (!hasMoreMessages.value || isLoadingMore.value) return

    isLoadingMore.set(true)

    messageLimit.set(messageLimit.value + 20)
  }

  useEffect(() => {
    if (isLoadingMore.value && messagesContainerRef.current) {
      if (messages.length >= messageLimit.value) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight - scrollPosition.value
      } else {
        hasMoreMessages.set(false)
      }

      isLoadingMore.set(false)
    }
  }, [messages, isLoadingMore.value])

  useEffect(() => {
    if (messagesEndRef.current && (!isUserScrolled.value || messages.length <= 1)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isUserScrolled.value])

  const isCallActive = targetChannelId === selectedChannelID && !!mediaConnected

  const startMediaCall = (video: boolean) => {
    if (!selectedChannelID) return
    if (video) {
      MediaStreamState.toggleWebcamPaused()
    }
    const inChannelCall = targetChannelId === selectedChannelID
    getMutableState(ChannelState).targetChannelId.set(inChannelCall ? ('' as ChannelID) : selectedChannelID)
  }

  if (!selectedChannelID) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white">
        <div className="p-6 text-center">
          <h3 className="mb-2 text-xl font-semibold text-gray-700">Select a conversation</h3>
          <p className="text-gray-500">Choose a conversation from the list or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-[#3F3960]">{channel ? getChannelName(channel) : 'Loading...'}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => startMediaCall(true)}>
            <HiVideoCamera className="h-5 w-5 text-[#3F3960]" />
          </button>

          <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => startMediaCall(false)}>
            <HiPhone className="h-5 w-5 text-[#3F3960]" />
          </button>

          {isCallActive && (
            <>
              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => MediaStreamState.toggleScreenshare()}
                title="Share Screen"
              >
                <Screenshare className="h-5 w-5 text-[#3F3960]" />
              </button>

              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => mediaSessionState.isPopout.set(!mediaSessionState.isPopout.value)}
                title={mediaSessionState.isPopout.value ? 'Close Popout' : 'Popout View'}
              >
                <MdOpenInNew className="h-5 w-5 text-[#3F3960]" />
              </button>

              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => mediaSessionState.isExpanded.set(!mediaSessionState.isExpanded.value)}
                title={mediaSessionState.isExpanded.value ? 'Collapse View' : 'Expand View'}
              >
                <Maximize02Lg className="h-5 w-5 text-[#3F3960]" />
              </button>

              <button
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => {
                  if (mediaSessionState.isFullscreen.value) {
                    if (document.exitFullscreen) {
                      document.exitFullscreen()
                    }
                    mediaSessionState.isFullscreen.set(false)
                  } else {
                    const mediaContainer = document.getElementById('media-session-container')
                    if (mediaContainer?.requestFullscreen) {
                      mediaContainer.requestFullscreen()
                      mediaSessionState.isFullscreen.set(true)
                    }
                  }
                }}
                title={mediaSessionState.isFullscreen.value ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                <Expand06Lg className="h-5 w-5 text-[#3F3960]" />
              </button>
            </>
          )}
        </div>
      </div>

      {selectedChannelID && <CallParticipants channelId={selectedChannelID} />}

      {isCallActive && !mediaSessionState.isPopout.value && (
        <>
          {!mediaSessionState.isExpanded.value && !mediaSessionState.isFullscreen.value ? (
            <div id="media-session-container">
              <Resizable
                className="overflow-hidden bg-gray-100"
                size={{ width: '100%', height: videoHeight.value }}
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
                minHeight={200}
                maxHeight={600}
                onResizeStop={(_e, _direction, _ref, d) => {
                  const newHeight = videoHeight.value + d.height
                  videoHeight.set(newHeight)

                  localStorage.setItem('videoContainerHeight', newHeight.toString())
                }}
                handleComponent={{
                  bottom: (
                    <div className="flex h-6 w-full cursor-ns-resize items-center justify-center border-b border-t border-gray-300 bg-gray-200 hover:bg-gray-300">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="h-[2px] w-10 rounded-full bg-gray-500"></div>
                        <div className="h-[2px] w-10 rounded-full bg-gray-500"></div>
                      </div>
                    </div>
                  )
                }}
              >
                <div className="h-full w-full p-2">
                  <MediaCall isExpanded={false} />
                </div>
              </Resizable>
            </div>
          ) : (
            <div
              id="media-session-container"
              className={`bg-gray-100 p-2 ${
                mediaSessionState.isExpanded.value && !mediaSessionState.isFullscreen.value
                  ? 'fixed inset-0 z-40 overflow-hidden shadow-lg'
                  : ''
              } ${mediaSessionState.isFullscreen.value ? 'fixed inset-0 z-50 overflow-hidden' : ''}`}
            >
              <MediaCall isExpanded={mediaSessionState.isExpanded.value} />
            </div>
          )}
        </>
      )}

      <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef} onScroll={handleScroll}>
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#3F3960]"></div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageItem key={index} message={message} isSelf={message.sender?.id === getState(EngineState).userID} />
            ))}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput channelId={selectedChannelID} />
    </div>
  )
}

interface MessageItemProps {
  message: any
  isSelf: boolean
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isSelf }) => {
  const userThumbnail = useUserAvatarThumbnail(message.sender?.id)
  const timestamp = message.createdAt ? formatMessageTimestamp(message.createdAt) : ''

  return (
    <div className={`mb-4 flex items-start ${isSelf ? 'justify-end' : ''}`}>
      {!isSelf && <img src={userThumbnail} alt="User avatar" className="mr-3 mt-1 h-8 w-8 rounded-full" />}
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isSelf ? 'rounded-tr-none bg-[#E1E1E1] text-black' : 'rounded-tl-none bg-[#F8F8F8] text-black'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {!isSelf && <p className="text-xs font-medium text-[#3F3960]">{message.sender?.name}</p>}
          <span className="flex-shrink-0 text-xs text-gray-500">{timestamp}</span>
        </div>
        <p className="mt-1 text-sm">{message.text}</p>
      </div>
      {isSelf && <img src={userThumbnail} alt="User avatar" className="ml-3 mt-1 h-8 w-8 rounded-full" />}
    </div>
  )
}

interface MessageInputProps {
  channelId: ChannelID
}

const MessageInput: React.FC<MessageInputProps> = ({ channelId }) => {
  const message = useHookstate('')
  const mutateMessage = useMutation(messagePath)

  const handleSendMessage = () => {
    if (!message.value.trim()) return

    mutateMessage.create({
      text: message.value,
      channelId: channelId
    })

    message.set('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center rounded-lg bg-[#F2F3F5] p-1">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <HiPaperClip className="h-5 w-5" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border-none bg-transparent px-3 py-2 focus:outline-none"
          value={message.value}
          onChange={(e) => message.set(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="rounded-md bg-[#3F3960] p-2 text-white hover:bg-[#2D2A45] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={!message.value.trim()}
        >
          <HiPaperAirplane className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
