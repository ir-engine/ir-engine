import { createState } from '@speigg/hookstate'
import React, { useEffect, useRef, useState } from 'react'

import { useLocationInstanceConnectionState } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { ChatService, useChatState } from '@xrengine/client-core/src/social/services/ChatService'
// import { getChatMessageSystem, removeMessageSystem } from '@xrengine/client-core/src/social/services/utils/chatSystem'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
// import { isCommand } from '@xrengine/engine/src/common/functions/commandHandler'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import Avatar from '@mui/material/Avatar'
import ListItemAvatar from '@mui/material/ListItemAvatar'

import { useChatHooks } from '../../../components/InstanceChat'
import styleString from './index.scss'

export function createChatDetailView() {
  return createXRUI(ChatDetailView, createChatDetailState())
}

function createChatDetailState() {
  return createState({})
}

interface ChatDetailState {
  chatMenuOpen: boolean
}

// TODO: update this to newest chat implementation
const ChatDetailView = () => {
  const detailState = useXRUIState<ChatDetailState>()

  const [chatWindowOpen, setChatWindowOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(false)

  const { dimensions, sortedMessages, handleComposingMessageChange, packageMessage, composingMessage } = useChatHooks({
    chatWindowOpen,
    setUnreadMessages,
    messageRefInput: null!
  })

  const user = useAuthState().user

  const getMessageUser = (message): string => {
    let returned = message.sender?.name
    if (message.senderId === user.id.value) returned += ' (you)'
    //returned += ': '
    return returned
  }

  const isMessageSentBySelf = (message): boolean => {
    return message.senderId === user.id.value
  }

  const getAvatar = (message): any => {
    return (
      dimensions.width > 768 && (
        <ListItemAvatar className="avatarItem">
          <Avatar src={message.sender?.avatarUrl} className="avatar" />
        </ListItemAvatar>
      )
    )
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="chatContainer" xr-layer="true">
        <div className="messageList">
          {sortedMessages.map((message) => {
            let chatMessage = message.text
            return (
              <li
                key={message.id}
                className={`messageItem ${isMessageSentBySelf(message) ? 'messageEnd' : 'messageStart'}`}
              >
                <div className={`messageRow ${isMessageSentBySelf(message) ? 'messageEnd' : 'messageStart'}`}>
                  {!isMessageSentBySelf(message) && getAvatar(message)}
                  <div className="messageContent">
                    <span className="messageChild">
                      <span>
                        <span className="senderName">{getMessageUser(message)}</span>
                        <p className="senderMessag">{chatMessage}</p>
                      </span>
                    </span>
                  </div>
                  {isMessageSentBySelf(message) && getAvatar(message)}
                </div>
              </li>
            )
          })}
        </div>
        <div className="messageBoxContainer">
          <input
            type="text"
            placeholder={'World Chat...'}
            value={composingMessage}
            onChange={(evt) => handleComposingMessageChange(evt)}
            className={`messageInputBox ${detailState.chatMenuOpen.value ? '' : 'hide'}`}
            onKeyDown={(evt) => handleComposingMessageChange(evt)}
          />
        </div>
      </div>
    </>
  )
}
