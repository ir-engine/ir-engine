import { createState, useHookstate } from '@hookstate/core'
import React, { Fragment, useRef, useState } from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { getState } from '@xrengine/hyperflux'

import { Send } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'

import { useChatHooks } from '../../../components/InstanceChat'
import { getAvatarURLForUser } from '../../../user/components/UserMenu/util'
import XRInput from '../../components/XRInput'
import styleString from './index.scss'

export function createChatDetailView() {
  return createXRUI(ChatDetailView, createChatDetailState())
}

function createChatDetailState() {
  return createState({})
}

const ChatDetailView = () => {
  const [unreadMessages, setUnreadMessages] = useState(false)

  const { activeChannel, handleComposingMessageChange, packageMessage, composingMessage } = useChatHooks({
    chatWindowOpen: true,
    setUnreadMessages,
    messageRefInput: null!
  })

  const sortedMessages = activeChannel?.messages?.get({ noproxy: true })?.length
    ? [...activeChannel.messages.get({ noproxy: true })].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : []

  const user = useAuthState().user

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  return (
    <>
      <style>{styleString}</style>
      <div className="chatContainer" xr-layer="true">
        <div className="messageList">
          {sortedMessages.map((message, index, messages) => {
            return (
              <Fragment key={index}>
                {message.isNotification ? (
                  <div key={message.id} className="selfEnd noMargin">
                    <div className="dFlex">
                      <div className="msgNotification mx2">
                        <p className="shadowText">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="dFlex flexColumn mgSmall">
                    <div className="selfEnd noMargin">
                      <div
                        className={`${
                          message.senderId !== user?.id.value ? 'msgReplyContainer' : 'msgOwner'
                        } msgContainer dFlex`}
                      >
                        <div className="msgWrapper">
                          {messages[index - 1] && messages[index - 1].isNotification ? (
                            <h3 className="sender">{message.sender.name}</h3>
                          ) : (
                            messages[index - 1] &&
                            message.senderId !== messages[index - 1].senderId && (
                              <h3 className="sender">{message.sender.name}</h3>
                            )
                          )}
                          <p className="text">{message.text}</p>
                        </div>
                        {index !== 0 && messages[index - 1] && messages[index - 1].isNotification ? (
                          <Avatar src={getAvatarURLForUser(userAvatarDetails, message.senderId)} className="avatar" />
                        ) : (
                          messages[index - 1] &&
                          message.senderId !== messages[index - 1].senderId && (
                            <Avatar src={getAvatarURLForUser(userAvatarDetails, message.senderId)} className="avatar" />
                          )
                        )}
                        {index === 0 && (
                          <Avatar src={getAvatarURLForUser(userAvatarDetails, message.senderId)} className="avatar" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
        <div className="messageBoxContainer">
          <XRInput
            className="messageInputBox"
            id="newMessage"
            placeholder={'World Chat...'}
            name="newMessage"
            value={composingMessage}
            onChange={handleComposingMessageChange}
            onKeyDown={(evt) => handleComposingMessageChange(evt)}
            endIcon={<Send fontSize="small" />}
            endIconClick={packageMessage}
            border={false}
          />
        </div>
      </div>
    </>
  )
}
