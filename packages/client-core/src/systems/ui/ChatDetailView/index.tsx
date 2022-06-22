import { createState } from '@speigg/hookstate'
import React, { Fragment, useRef, useState } from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { Send } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import ListItemAvatar from '@mui/material/ListItemAvatar'

import { useChatHooks } from '../../../components/InstanceChat'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
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
  const [unreadMessages, setUnreadMessages] = useState(false)
  const messageRefInput = useRef<HTMLInputElement>()

  const { dimensions, sortedMessages, handleComposingMessageChange, packageMessage, composingMessage } = useChatHooks({
    chatWindowOpen: true,
    setUnreadMessages,
    messageRefInput: null!
  })

  const user = useAuthState().user

  const isLeftOrJoinText = (text: string) => {
    return / left the layer|joined the layer/.test(text)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="chatContainer" xr-layer="true">
        <div className="messageList">
          {sortedMessages.map((message, index, messages) => {
            return (
              <Fragment key={index}>
                {!isLeftOrJoinText(message.text) ? (
                  <div key={index} className="dFlex flexColumn mgSmall">
                    <div className="selfEnd noMargin">
                      <div className="dFlex">
                        <div className="msgWrapper">
                          {messages[index - 1] && isLeftOrJoinText(messages[index - 1].text) ? (
                            <h3 className="sender">{message.sender.name}</h3>
                          ) : (
                            messages[index - 1] &&
                            message.senderId !== messages[index - 1].senderId && (
                              <h3 className="sender">{message.sender.name}</h3>
                            )
                          )}
                          <div
                            className={`${
                              message.senderId !== user?.id.value ? 'msgReplyContainer' : 'msgOwner'
                            } msgContainer mx2`}
                          >
                            <p className="text">{message.text}</p>
                          </div>
                        </div>
                        {index !== 0 && messages[index - 1] && isLeftOrJoinText(messages[index - 1].text) ? (
                          <Avatar src={getAvatarURLForUser(message.senderId)} className="avatar" />
                        ) : (
                          messages[index - 1] &&
                          message.senderId !== messages[index - 1].senderId && (
                            <Avatar src={getAvatarURLForUser(message.senderId)} className="avatar" />
                          )
                        )}
                        {index === 0 && <Avatar src={getAvatarURLForUser(message.senderId)} className="avatar" />}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="selfEnd noMargin">
                    <div className="dFlex">
                      <div className="msgNotification mx2">
                        <p className="greyText">{message.text}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
        <div className="messageBoxContainer">
          <input
            className="messageInputBox"
            id="newMessage"
            placeholder={'World Chat...'}
            name="newMessage"
            value={composingMessage}
            onChange={handleComposingMessageChange}
            onKeyDown={(evt) => handleComposingMessageChange(evt)}
          />
          <div onClick={packageMessage} className="sendButton">
            <Send fontSize="small" />
          </div>
        </div>
      </div>
    </>
  )
}
