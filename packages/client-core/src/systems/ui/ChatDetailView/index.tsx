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

import { createState, useHookstate } from '@hookstate/core'
import React, { Fragment, useState } from 'react'

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { getMutableState } from '@etherealengine/hyperflux'
import Avatar from '@etherealengine/ui/src/primitives/mui/Avatar'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { useChatHooks } from '../../../components/InstanceChat'
import { getUserAvatarThumbnail } from '../../../user/functions/useUserAvatarThumbnail'
import XRInput from '../../components/XRInput'
import styleString from './index.scss?inline'

/** @deprecated */
export function createChatDetailView() {
  return createXRUI(ChatDetailView, createChatDetailState())
}

function createChatDetailState() {
  return createState({})
}
/** @deprecated */
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

  const user = useHookstate(getMutableState(AuthState)).user

  const userAvatarDetails = useHookstate(getMutableState(WorldState).userAvatarDetails)

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
                          <Avatar src={getUserAvatarThumbnail(message.senderId)} className="avatar" />
                        ) : (
                          messages[index - 1] &&
                          message.senderId !== messages[index - 1].senderId && (
                            <Avatar src={getUserAvatarThumbnail(message.senderId)} className="avatar" />
                          )
                        )}
                        {index === 0 && <Avatar src={getUserAvatarThumbnail(message.senderId)} className="avatar" />}
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
            endIcon={<Icon type="Send" fontSize="small" />}
            endIconClick={packageMessage}
            border={false}
          />
        </div>
      </div>
    </>
  )
}
