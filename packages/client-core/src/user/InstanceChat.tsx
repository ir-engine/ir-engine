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

import { useFind, useMutation } from '@ir-engine/common'
import { InstanceID, MessageType, messagePath } from '@ir-engine/common/src/schema.type.module'
import { useTouchOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { State, UserID, dispatchAction, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { PeerMediaChannelState } from '@ir-engine/network/src/media/PeerMediaChannelState'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { Button } from '@ir-engine/ui'
import {
  ArrowTopRightOnSquareSm,
  MessageTextSquare01Lg,
  MessageTextSquare01Md,
  Send01Lg,
  Send01Sm,
  XCloseLg,
  XCloseSm
} from '@ir-engine/ui/src/icons'
import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'
import { ModalState } from '../common/services/ModalState'
import { ChannelState } from '../social/services/ChannelService'
import { AvatarUIActions, AvatarUIState } from '../systems/state/AvatarUIState'
import { ReportUserState } from '../util/ReportUserState'
import LocationIconButton from './components/LocationIconButton'
import ProfileMenu from './menus/ProfileMenu'
import { AuthState } from './services/AuthService'

const InstanceChatContext = createContext({
  messages: {} as State<MessageType[]>,
  isChatOpen: {} as State<boolean>,
  unreadMessages: {} as State<boolean>,
  newMessages: {} as State<{ [mid: MessageType['id']]: boolean }>,
  setNewMessage: (_: MessageType['id']) => {}
})

const InstanceChatProvider = ({ children }: { children: React.ReactNode }) => {
  const messages = useHookstate<MessageType[]>([])
  const newMessages = useHookstate<{ [mid: MessageType['id']]: boolean }>({})
  const unreadMessages = useHookstate(false)
  const isChatOpen = useHookstate(isMobile ? false : true)
  const user = useMutableState(AuthState).user
  const targetChannelId = useMutableState(ChannelState).targetChannelId
  const channelState = useMutableState(ChannelState)
  const messagesResponse = useFind(messagePath, {
    query: {
      channelId: targetChannelId.value,
      $limit: 100,
      $sort: { createdAt: -1 }
    }
  })

  const setNewMessage = (messageId: MessageType['id']) => {
    newMessages.merge({ [messageId]: true })
    const lightenMessageBackground = setTimeout(() => {
      newMessages.merge({ [messageId]: false })
      clearTimeout(lightenMessageBackground)
    }, 30_000)
  }

  useEffect(() => {
    if (['error', 'pending'].includes(messagesResponse.status)) return
    messages.set(messagesResponse.data.toReversed())
    messagesResponse.data.forEach((message) => {
      if (!(message.id in newMessages.value)) {
        setNewMessage(message.id)
        if (message.senderId !== user.id.value && !message.isNotification) {
          AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.message)
        }
      }
    })
  }, [messagesResponse.data, messagesResponse.status])

  useEffect(() => {
    if (!isChatOpen.value && messages.at(-1)?.senderId.value !== user.id.value && channelState.messageCreated.value) {
      unreadMessages.set(true)
    } else {
      unreadMessages.set(false)
    }
  }, [channelState.messageCreated, isChatOpen, messages])

  return (
    <InstanceChatContext.Provider value={{ messages, newMessages, isChatOpen, unreadMessages, setNewMessage }}>
      {children}
    </InstanceChatContext.Provider>
  )
}

const useInstanceChatMessages = () => useContext(InstanceChatContext)

function NewMessage() {
  const composedMessage = useHookstate('')
  const targetChannelId = useMutableState(ChannelState).targetChannelId
  const user = useMutableState(AuthState).user
  const usersTyping = useMutableState(AvatarUIState).usersTyping[user?.id.value].value
  const messageMutation = useMutation(messagePath, false)
  const { messages, setNewMessage, isChatOpen } = useInstanceChatMessages()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleComposedMessage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const message = event.target.value
    if (message.length > composedMessage.value.length && !usersTyping) {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: true
        })
      )
    } else if ((message.length == 0 || message.length < composedMessage.value.length) && usersTyping) {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: false
        })
      )
    }
    composedMessage.set(message)
  }

  const sendMessage = () => {
    const instanceId = NetworkState.worldNetwork.id as InstanceID
    if (composedMessage.value.trim().length && instanceId) {
      if (usersTyping) {
        dispatchAction(
          AvatarUIActions.setUserTyping({
            typing: false
          })
        )
      }
      messageMutation
        .create({
          text: composedMessage.value,
          channelId: targetChannelId.value
        })
        .then((message) => {
          setNewMessage(message.id)
          messages.merge([message])
        })
      composedMessage.set('')
      inputRef.current?.focus()
    }
  }

  useEffect(() => {
    if (!composedMessage.value || !usersTyping) return
    const delayDebounce = setTimeout(() => {
      dispatchAction(
        AvatarUIActions.setUserTyping({
          typing: false
        })
      )
    }, 3000)
    return () => clearTimeout(delayDebounce)
  }, [composedMessage.value])

  return (
    <div className="mt-5 flex w-full items-center justify-end">
      <div
        className={twMerge(
          'height-[30px] lg:height-[74px] mr-4 flex items-center justify-between rounded-[37px] bg-ui-background transition-[width,transform] duration-500 lg:ml-[13px] lg:mr-0 lg:bg-black/50',
          isChatOpen.value ? 'w-full translate-x-0' : 'hidden'
        )}
      >
        <input
          ref={inputRef}
          value={composedMessage.value}
          spellCheck={false}
          autoComplete="off"
          className="my-auto ml-5 flex w-full resize-none items-center justify-start bg-transparent text-sm text-text-primary outline-none lg:ml-8 lg:mr-4 lg:text-base lg:text-white"
          onKeyUp={(event) => event.key === 'Enter' && sendMessage()}
          onChange={handleComposedMessage}
        />
        <span className="sm:m-[5px] sm:mr-2.5">
          {isMobile ? (
            <Send01Sm className="text-text-primary" onClick={sendMessage} />
          ) : (
            <LocationIconButton icon={Send01Lg} onClick={sendMessage} />
          )}
        </span>
      </div>
    </div>
  )
}

function ReportUserButton({ userId }: { userId: UserID }) {
  const peerId = NetworkState.mediaNetwork.users[userId]?.[0]
  const peerMediaChannelState = useMutableState(PeerMediaChannelState)
  if (!peerId) return null

  const isCameraVisibile = peerMediaChannelState[peerId]?.['cam']?.value
  if (!isCameraVisibile) return null

  return (
    <button onClick={() => ReportUserState.setReportedPeerId(peerId)}>
      <ArrowTopRightOnSquareSm />
    </button>
  )
}

function Message({ message, hideUsername }: { message: MessageType; hideUsername: boolean }) {
  const user = useMutableState(AuthState).user
  const { newMessages } = useInstanceChatMessages()

  return message.isNotification ? (
    <div
      className="my-4 place-self-center text-center text-xs text-text-primary lg:text-sm"
      style={{
        textShadow: isMobile ? '' : '0px 1px 4px rgb(255, 255, 255)'
      }}
    >
      {message.text}
    </div>
  ) : (
    <div
      className={twMerge(
        'my-4 mr-[11px] w-fit place-self-start rounded-[14px] bg-surface-3 px-2 py-0.5 opacity-50 lg:rounded-[11px] lg:py-2.5',
        message.sender.id === user.id.value && 'place-self-end bg-surface-0',
        newMessages.value[message.id] && 'opacity-100',
        hideUsername && '-mt-3'
      )}
    >
      {message.senderId !== user.id.value && !hideUsername && (
        <div className="flex items-center gap-x-2 text-xs font-bold text-text-primary lg:text-lg">
          {message.sender.name} <ReportUserButton userId={message.senderId} />
        </div>
      )}
      <div className="text-sm tracking-[-0.14px] text-text-primary lg:text-base lg:tracking-normal">{message.text}</div>
    </div>
  )
}

function Messages() {
  const { messages, isChatOpen } = useInstanceChatMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!scrollRef.current || !isChatOpen.value) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [isChatOpen, messages])

  if (!isChatOpen.value) return null
  return (
    <div className="flex max-h-[65dvh] flex-col justify-end lg:max-h-[45vh]">
      <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
        {messages.value.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            hideUsername={
              index > 0 &&
              !messages[index - 1].isNotification.value &&
              message.sender.id === messages[index - 1].sender.id.value
            }
          />
        ))}
      </div>
    </div>
  )
}

function MessagesWrapper() {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const { isChatOpen, unreadMessages } = useInstanceChatMessages()
  const ageVerified = useMutableState(AuthState).user.ageVerified.value
  const isGuest = useMutableState(AuthState).user.isGuest.value
  const isHidden = useHookstate(false)
  useTouchOutside(ref, () => {
    if (!isChatOpen.value) return
    isChatOpen.set(false)
  })

  return (
    <div className="flex items-end">
      {ageVerified && (
        <div className="relative max-w-16">
          {!isChatOpen.value && unreadMessages.value && (
            <div className="absolute right-0 top-0 h-4 w-4 rounded-full bg-blue-500" />
          )}
          {!isMobile && isChatOpen.value && (
            <LocationIconButton
              icon={isChatOpen.value ? XCloseLg : MessageTextSquare01Lg}
              onClick={() => isChatOpen.set(!isChatOpen.value)}
              className="h-[20px] w-[20px] lg:h-[24px] lg:w-[24px]"
            />
          )}
          {!isChatOpen.value && (
            <LocationIconButton
              icon={MessageTextSquare01Md}
              onClick={() => isChatOpen.set(!isChatOpen.value)}
              className="h-[20px] w-[20px] lg:h-[24px] lg:w-[24px]"
            />
          )}
        </div>
      )}
      {!isHidden.value && !ageVerified ? (
        <div className="static rounded-lg bg-surface-4 p-4">
          {isMobile && (
            <button
              onClick={() => isHidden.set(!isHidden.value)}
              className={twMerge(
                'absolute left-[-18px] top-[-13px] flex h-[36px] w-[36px] select-none items-center justify-center rounded-full bg-ui-tertiary'
              )}
            >
              <XCloseSm className={twMerge('h-[15px] w-[15px] text-text-primary')} />
            </button>
          )}
          <div className="mx-auto text-center font-semibold text-[#3B3A3A]">{t('user:instanceChat.wantToChat')}</div>
          <Button
            variant="secondary"
            className="mx-auto mt-4 rounded-[20px]"
            onClick={() => ModalState.openModal(<ProfileMenu />)}
          >
            {isGuest ? t('user:instanceChat.register') : t('user:instanceChat.verifyAge')}
          </Button>
        </div>
      ) : (
        <div className={`lg:ml-[13px] ${isChatOpen.value ? 'w-[25dvw]' : 'w-0'}`} ref={ref}>
          <Messages />
          <NewMessage />
        </div>
      )}
    </div>
  )
}

export default function InstanceChat() {
  const mediaNetworkState = useMediaNetwork()
  const networkState = useMutableState(NetworkState)

  if (networkState.config.media.value && !mediaNetworkState?.ready?.value) return null

  return (
    <InstanceChatProvider>
      <MessagesWrapper />
    </InstanceChatProvider>
  )
}
