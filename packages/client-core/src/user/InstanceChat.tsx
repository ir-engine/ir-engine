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
import { State, dispatchAction, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { MessageTextSquare01Lg, Send01Lg, XCloseLg } from '@ir-engine/ui/src/icons'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'
import { PopoverState } from '../common/services/PopoverState'
import { ChannelState } from '../social/services/ChannelService'
import { AvatarUIActions, AvatarUIState } from '../systems/state/AvatarUIState'
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
  const isChatOpen = useHookstate(true)
  const user = useMutableState(AuthState).user
  const targetChannelId = useMutableState(ChannelState).targetChannelId
  const channelState = useMutableState(ChannelState)
  const messagesResponse = useFind(messagePath, {
    query: {
      channelId: targetChannelId.value,
      $limit: 20,
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
      }
    })
  }, [messagesResponse.data, messagesResponse.status])

  useEffect(() => {
    if (!isChatOpen && messages.at(-1)?.senderId.value !== user.id.value && channelState.messageCreated.value) {
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
  const { messages, setNewMessage, isChatOpen, unreadMessages } = useInstanceChatMessages()
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

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isChatOpen.value || !inputRef.current) {
      setIsMounted(false)
      return
    }

    setIsMounted(true)
  }, [isChatOpen])

  return (
    <div className="mt-5 flex w-full items-center justify-end">
      <div className="relative w-16">
        {!isChatOpen.value && unreadMessages.value && (
          <div className="absolute right-0 top-0 h-4 w-4 rounded-full bg-blue-500" />
        )}
        <LocationIconButton
          icon={isChatOpen.value ? XCloseLg : MessageTextSquare01Lg}
          onClick={() => isChatOpen.set(!isChatOpen.value)}
        />
      </div>
      <div
        className={twMerge(
          'height-[74px] ml-[13px] flex  items-center justify-between rounded-[37px] bg-black/50 transition-[width,transform] duration-500',
          isChatOpen.value ? 'w-full translate-x-0' : 'w-0 translate-x-[100%]'
        )}
      >
        <input
          ref={inputRef}
          value={composedMessage.value}
          spellCheck={false}
          autoComplete="off"
          className="my-auto ml-8 mr-4 flex w-full resize-none items-center justify-start bg-transparent text-base text-white outline-none"
          onKeyUp={(event) => event.key === 'Enter' && sendMessage()}
          onChange={handleComposedMessage}
        />
        <span className="m-[5px]">
          <LocationIconButton icon={Send01Lg} onClick={sendMessage} />
        </span>
      </div>
    </div>
  )
}

function Message({ message, hideUsername }: { message: MessageType; hideUsername: boolean }) {
  const user = useMutableState(AuthState).user
  const { newMessages } = useInstanceChatMessages()

  return message.isNotification ? (
    <div
      className="place-self-center text-center text-sm text-white"
      style={{
        textShadow: '0px 1px 4px rgba(255, 255, 255, 1);'
      }}
    >
      {message.text}
    </div>
  ) : (
    <div
      className={twMerge(
        'w-full max-w-[15vw] rounded-[11px] bg-white px-2 py-[11px] opacity-50',
        message.sender.id === user.id.value && 'place-self-end',
        newMessages.value[message.id] && 'opacity-100'
      )}
    >
      {!hideUsername && <div className="font-bold text-[#444444]">{message.sender.name}</div>}
      <div className="mt-[9px] text-sm text-[#444444]">{message.text}</div>
    </div>
  )
}

function Messages() {
  const { messages, isChatOpen } = useInstanceChatMessages()
  if (!isChatOpen.value) return null
  return (
    <div className="h-[45vh] overflow-y-auto">
      <div className="flex h-full flex-col justify-end gap-y-[13px]">
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

export default function InstanceChat() {
  const { t } = useTranslation()
  const ageVerified = useMutableState(AuthState).user.ageVerified.value
  const mediaNetworkState = useMediaNetwork()
  const networkState = useMutableState(NetworkState)
  const isGuest = useMutableState(AuthState).user.isGuest.value

  if (networkState.config.media.value && !mediaNetworkState?.ready.value) return null

  return (
    <InstanceChatProvider>
      {isGuest || !ageVerified ? (
        <div className="rounded-lg bg-[#C6C6C6] p-4">
          <div className="mx-auto text-center font-semibold text-[#3B3A3A]">{t('user:instanceChat.wantToChat')}</div>
          <button
            className="mt-4 flex items-center justify-center rounded-[20px] bg-[#969696] px-[30px] py-1.5"
            onClick={() => PopoverState.showPopupover(<ProfileMenu />)}
          >
            {isGuest ? t('user:instanceChat.register') : t('user:instanceChat.verifyAge')}
          </button>
        </div>
      ) : (
        <div className="w-[25vw]">
          <Messages />
          <NewMessage />
        </div>
      )}
    </InstanceChatProvider>
  )
}
