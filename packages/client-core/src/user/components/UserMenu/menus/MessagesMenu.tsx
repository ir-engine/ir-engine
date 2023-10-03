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

import React from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ChannelID } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import { useTranslation } from 'react-i18next'
import InputText from '../../../../common/components/InputText'
import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { ChannelService, ChannelState } from '../../../../social/services/ChannelService'
import XRIconButton from '../../../../systems/components/XRIconButton'
import { useUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { PopupMenuServices } from '../PopupMenuService'

// This file is a raw css copy of packages/ui/src/components/Chat/Message.tsx
// Once location is migrated to tailwind, this file can use that tailwind code instead

/**
 * @todo
 *
 */

const MessagesMenu = (props: { channelID: ChannelID; name: string }): JSX.Element => {
  const { t } = useTranslation()

  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userID)

  const { data: messages } = useFind(messagePath, {
    query: {
      channelId: props.channelID,
      $sort: {
        createdAt: 1
      }
    }
  })

  const channelState = useHookstate(getMutableState(ChannelState))
  const inChannelCall = channelState.targetChannelId.value === props.channelID

  const startMediaCall = () => {
    ChannelService.joinChannelInstance(inChannelCall ? ('' as ChannelID) : props.channelID)
  }

  const SelfMessage = (props: { message: (typeof messages)[0] }) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '24px', marginLeft: 'auto' }}>
        <div style={{ height: '20px', marginLeft: '147px', marginRight: '20px' }}>
          <p
            style={{
              borderRadius: '20px',
              border: '2px solid #E1E1E1',
              color: 'black',
              backgroundColor: '#E1E1E1',
              padding: '3px'
            }}
          >
            {props.message.text}
          </p>
        </div>
        <img
          style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
          alt=""
          src={userThumbnail}
        />
      </div>
    )
  }

  const OtherMessage = (props: { message: (typeof messages)[0] }) => {
    const systemMessage = !props.message.sender
    const userThumbnail = useUserAvatarThumbnail(props.message.sender?.id)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: systemMessage ? 'auto' : '', marginRight: 'auto' }}>
        {!systemMessage && (
          <img
            style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
            alt=""
            src={userThumbnail}
          />
        )}
        <div style={{ height: '20px', marginLeft: '20px' }}>
          <p
            style={{
              borderRadius: '20px',
              border: systemMessage ? '' : '2px solid #F8F8F8',
              color: 'black',
              backgroundColor: systemMessage ? '' : '#F8F8F8',
              padding: '3px'
            }}
          >
            {props.message.text}
          </p>
        </div>
      </div>
    )
  }

  const MessageField = () => {
    const composingMessage = useHookstate('')

    const mutateMessage = useMutation(messagePath)

    const sendMessage = () => {
      mutateMessage.create({
        text: composingMessage.value,
        channelId: props.channelID
      })
      composingMessage.set('')
    }

    const handleMessageKeyDown = (event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault()
        const selectionStart = (event.target as HTMLInputElement).selectionStart

        composingMessage.set(
          composingMessage.value.substring(0, selectionStart || 0) +
            '\n' +
            composingMessage.value.substring(selectionStart || 0)
        )
        return
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
        return
      }
    }

    return (
      <div style={{ position: 'absolute', bottom: '0px', display: 'flex' }}>
        <InputText
          endIcon={<Icon type="Send" />}
          startIcon={
            <img
              style={{ maxWidth: '100%', borderRadius: '38px', width: '36px', height: '36px', objectFit: 'cover' }}
              alt=""
              src={userThumbnail}
            />
          }
          placeholder={t('user:messages.enterMessage')}
          sx={{ mb: 1, mt: 0 }}
          value={composingMessage.value}
          onChange={(e) => composingMessage.set(e.target.value)}
          onKeyDown={(e) => handleMessageKeyDown(e)}
          onEndIconClick={sendMessage}
        />
        <XRIconButton
          size="large"
          xr-layer="true"
          title={t('user:friends.call')}
          style={{ position: 'absolute', right: '0px' }}
          variant="iconOnly"
          onClick={() => startMediaCall()}
          content={<Icon type={inChannelCall ? 'CallEnd' : 'Call'} />}
        />
      </div>
    )
  }

  return (
    <Menu open maxWidth="xs" sx={{}} title={props.name} onClose={() => PopupMenuServices.showPopupMenu()}>
      <XRIconButton
        size="large"
        xr-layer="true"
        className="iconBlock"
        variant="iconOnly"
        onClick={() => PopupMenuServices.showPopupMenu(SocialMenus.Friends)}
        content={<Icon type="ArrowBack" />}
      />
      <div style={{ height: '600px', maxWidth: '100%', overflowX: 'hidden' }}>
        <div
          style={{
            height: 'auto',
            marginLeft: '6px',
            marginBottom: '100px',
            marginTop: '4px',
            marginRight: '8px',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap'
          }}
        >
          {messages.map((message, index) => {
            if (message.sender?.id === Engine.instance.userID) return <SelfMessage key={index} message={message} />
            else return <OtherMessage key={index} message={message} />
          })}
        </div>
        <MessageField />
      </div>
    </Menu>
  )
}

export default MessagesMenu
