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

import { useChatHooks } from '../../components/InstanceChat'

const styles = {
  avatarItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '40px',
    height: '40px',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontSize: '1.25rem',
    lineHeight: '1',
    borderRadius: '50%',
    overflow: 'hidden',
    userSelect: 'none',
    color: 'var(--textColor)',
    backgroundColor: 'rgb(189, 189, 189)',
    margin: '0 10px'
  },
  avatar: {
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: 'currentcolor',
    flexShrink: '0',
    transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    fontSize: '1.5rem'
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '500px',
    minHeight: '208px',
    margin: '5px 15px 20px 10px',
    borderRadius: '5px',
    backgroundColor: 'var(--popupBackground)'
  },
  hide: { width: '0', overflow: 'hidden' },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '0px 10px',
    background: 'transparent'
  },
  messageItem: {
    color: 'var(--textColor)',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
    paddingTop: '8px',
    paddingBottom: '8px'
  },
  messageEnd: { justifyContent: 'flex-end', textAlign: 'end' },
  messageStart: { justifyContent: 'flex-start', textAlign: 'start' },
  messageRow: { width: '100%', display: 'flex' },
  messageContent: {
    borderRadius: '10px 10px 0 0,flex: 1 1 auto',
    minWidth: '0px',
    marginTop: '4px',
    marginBottom: '4px'
  },
  messageChild: {
    margin: '0px',
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '400',
    fontSize: '1rem',
    lineHeight: '1.5',
    letterSpacing: '0.00938em',
    display: 'block'
  },
  senderName: {
    color: 'var(--textColor)',
    fontWeight: '700'
  },
  senderMessage: {
    margin: '0px',
    padding: '0px'
  },
  messageBoxContainer: { borderRadius: '40px', background: 'transparent', boxShadow: 'none', width: '100%' },
  messageInputBox: {
    font: 'inherit',
    letterSpacing: 'inherit',
    padding: '4px 0px 5px',
    border: '0px',
    boxSizing: 'content-box',
    background: 'none',
    height: '1.4375em',
    margin: '10px 10px 5px 10px',
    display: 'block',
    minWidth: '0px',
    width: '100%',
    color: 'white'
  },
  chatButton: {
    margin: '5px 15px 10px 10px',
    alignItems: 'center',
    zIndex: '20',
    borderRadius: '50%',
    color: 'black',
    width: '50px',
    height: '50px',
    fontSize: '20px'
  }
}

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
        <ListItemAvatar style={styles.avatarItem as {}}>
          <Avatar src={message.sender?.avatarUrl} style={styles.avatar as {}} />
        </ListItemAvatar>
      )
    )
  }

  return (
    <div style={styles.chatContainer as {}} xr-layer="true">
      <div style={styles.messageList as {}}>
        {sortedMessages?.map((message) => {
          let chatMessage = message.text
          return (
            <li
              key={message.id}
              style={{
                ...(styles.messageItem as {}),
                ...((isMessageSentBySelf(message) ? styles.messageEnd : styles.messageStart) as {})
              }}
            >
              <div
                style={{
                  ...(styles.messageRow as {}),
                  ...((isMessageSentBySelf(message) ? styles.messageEnd : styles.messageStart) as {})
                }}
              >
                {!isMessageSentBySelf(message) && getAvatar(message)}
                <div style={styles.messageContent}>
                  <span style={styles.messageChild}>
                    <span>
                      <span style={styles.senderName}>{getMessageUser(message)}</span>
                      <p style={styles.senderMessage}>{chatMessage}</p>
                    </span>
                  </span>
                </div>
                {isMessageSentBySelf(message) && getAvatar(message)}
              </div>
            </li>
          )
        })}
      </div>
      <div style={styles.messageBoxContainer}>
        <input
          type="text"
          placeholder={'World Chat...'}
          value={composingMessage}
          onChange={(evt) => handleComposingMessageChange(evt)}
          style={{
            ...(styles.messageInputBox as {}),
            ...((detailState.chatMenuOpen.value ? {} : styles.hide) as {})
          }}
          onKeyDown={(evt) => handleComposingMessageChange(evt)}
        />
      </div>
    </div>
  )
}
