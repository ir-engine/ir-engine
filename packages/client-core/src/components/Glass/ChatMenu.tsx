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

import React from 'react'
import { HiChatBubbleLeftRight } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

import { useMutableState } from '@ir-engine/hyperflux'
import { Send01Md } from '@ir-engine/ui/src/icons'
import { AuthState } from '../../user/services/AuthService'
import { useChatProvider } from './ChatProvider'

const messageBaseStyles = `
  inline-grid
  max-w-full
  px-4 py-1

  border-2
  border-white/10
  rounded-xl
  shadow-lg

  break-words
  text-center
  
  sm:max-w-md
`

const blueGradientStyles = `
  bg-gradient-to-r
  from-blue-500
  from-40%

  via-blue-400
  via-90%

  to-blue-400
  to-100%
`

const Notification = ({ children }) => {
  return (
    <div
      className={`
        flex
        text-center
      `}
    >
      {children}
    </div>
  )
}

const OwnMessage = ({ children }) => (
  <div className={twMerge(messageBaseStyles, blueGradientStyles, `self-end`)}>{children}</div>
)

const OtherMessage = ({ children }) => <div className={twMerge(messageBaseStyles, `bg-black/30`)}>{children}</div>

const OtherName = ({ children }) => <div className={``}>{children}</div>

const OtherChat = ({ children }) => (
  <div
    className={`
      flex flex-col gap-y-1
    `}
  >
    {children}
  </div>
)

const BottomSpacer = () => <div className={`h-12`} />

const inputContainerStyles = `
  flex items-center
  w-full
  p-1
  pl-4
  rounded-full
  bg-black/10
  shadow-inner
`

const inputStyles = `
  bg-transparent
  border-none
  outline-none
  h-full
  w-full
`

const sendButtonStyles = `
  flex items-center
  
  p-2
  
  rounded-full
  text-white
  text-xl
  bg-blue-500
  border
  border-white/10
  shadow
`

const inputOuterStyles = `
  fixed
  bottom-0
  left-0
  right-0
  bg-black/30
  pb-4 px-4 pt-4
`

export const ChatMenu = ({ navigateTo }: { navigateTo: (screenKey: string, historyKey: string) => void }) => {
  const user = useMutableState(AuthState).user

  const isGuest = user.isGuest.value
  const onCTAClicked = () => navigateTo('Settings', 'signup')

  const { messageGroupedBySender, inputRef, handleInputChange, sendMessage, composedMessage } = useChatProvider()

  if (isGuest) {
    return (
      <div className="flex h-full max-w-screen-sm flex-col items-center justify-center gap-8 font-dm-sans">
        <HiChatBubbleLeftRight className="mx-auto h-[5.5rem] w-[5.5rem]" />
        <div className="text-shadow-md text-2xl text-white">Want to chat with others?</div>
        <button
          onClick={onCTAClicked}
          className="mt-6 w-[80%] rounded-full border border-white/20 bg-white/15 px-6 py-4 text-lg font-bold text-white/90 shadow-lg drop-shadow-xl backdrop-blur-sm"
        >
          Create an Account
        </button>
      </div>
    )
  }

  const onSubmit = (ev) => {
    ev.preventDefault()

    sendMessage()
  }

  const hasInputText = !!composedMessage.value

  return (
    <>
      {messageGroupedBySender.map((group, groupIndex) => {
        const [firstMessage] = group
        const isOwnGroup = firstMessage.senderId === user.id.value
        const isNotification = !!firstMessage.isNotification

        const MessageComponent = isNotification ? Notification : isOwnGroup ? OwnMessage : OtherMessage

        const groupedMessage = group.map((message, messageIndex) => {
          return <MessageComponent key={`${groupIndex}-${messageIndex}`}>{message.text}</MessageComponent>
        })

        return isOwnGroup || isNotification ? (
          groupedMessage
        ) : (
          <OtherChat key={groupIndex}>
            <OtherName>{firstMessage.sender.name}</OtherName>
            {groupedMessage}
          </OtherChat>
        )
      })}

      <div className={inputOuterStyles}>
        <form onSubmit={onSubmit}>
          <div className={inputContainerStyles}>
            <input className={inputStyles} onChange={handleInputChange} ref={inputRef} value={composedMessage.value} />
            <button
              className={twMerge(blueGradientStyles, sendButtonStyles, hasInputText ? `` : `invisible`)}
              type={'submit'}
            >
              <Send01Md />
            </button>
          </div>
        </form>
      </div>

      <BottomSpacer />
    </>
  )
}
