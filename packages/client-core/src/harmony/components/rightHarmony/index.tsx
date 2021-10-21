import React, { useState, useRef, useEffect } from 'react'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import IconButton from '@mui/material/IconButton'
import Call from '@mui/icons-material/Call'
import MoreHoriz from '@mui/icons-material/MoreHoriz'
import { useStyle, useStyles } from './style'
import InviteHarmony from '../inviteHarmony'
import Person from '@mui/icons-material/Person'
import ListItemText from '@mui/material/ListItemText'
import { useDispatch } from '../../../store'
import { ChatService } from '../../../social/services/ChatService'
import { useChatState } from '../../../social/services/ChatService'
import { useAuthState } from '../../../user/services/AuthService'
import { useUserState } from '../../../user/services/UserService'
import { ChatAction } from '../../../social/services/ChatService'
import { useChannelConnectionState } from '@xrengine/client-core/src/common/state/ChannelConnectionState'
import { store } from '@xrengine/client-core/src/store'

import CreateMessage from './CreateMessage'
import MessageList from './MessageList'
import queryString from 'querystring'

export default function RightHarmony() {
  const classex = useStyle()
  const classes = useStyles()
  const [openInvite, setOpenInvite] = React.useState(false)
  const dispatch = store.dispatch
  const userState = useUserState()
  const persed = queryString.parse(location.search)

  const messageRef = React.useRef()
  const messageEl = messageRef.current
  const selfUser = useAuthState().user
  const chatState = useChatState()
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelConnectionState = useChannelConnectionState()
  const channelEntries = Object.values(channels).filter((channel) => !!channel)!
  const channelRef = useRef(channels)

  const instanceChannel = channelEntries.find((entry) => entry.instanceId != null)!
  const targetObject = chatState.targetObject
  const targetObjectType = chatState.targetObjectType
  const targetChannelId = chatState.targetChannelId.value
  const messageScrollInit = chatState.messageScrollInit
  const activeChannel = channels.find((c) => c.channelType === targetObjectType.value)!

  const openInviteModel = (open: boolean) => {
    setOpenInvite(open)
  }

  useEffect(() => {
    if (channelState.updateNeeded) {
      ChatService.getChannels()
    }
  }, [channelState.updateNeeded.value])

  useEffect(() => {
    if (channelState.updateNeeded) {
      ChatService.getChannels()
      ChatService.getChannelMessages(targetChannelId)
    }
  }, [channelState.updateNeeded.value])

  useEffect(() => {
    if (targetChannelId) {
      ChatService.getChannelMessages(targetChannelId)
    }
  }, [targetChannelId])

  return (
    <div className={classes.rightRoot}>
      <div className={classes.title}>
        {activeChannel?.instance && (
          <ListItemAvatar>
            <Person />
          </ListItemAvatar>
        )}
        {activeChannel?.instance && (
          <ListItemText
            className={classes.listText}
            primary={activeChannel?.instance?.instanceUsers[0].name}
            secondary={<React.Fragment>{'online'}</React.Fragment>}
          />
        )}
        <div style={{ marginRight: '1.5rem' }}>
          <IconButton size="large">
            <Call className={classes.whiteIcon} />
          </IconButton>
          <IconButton onClick={() => openInviteModel(true)} size="large">
            <MoreHoriz className={classes.whiteIcon} />
          </IconButton>
        </div>
      </div>
      {activeChannel?.messages?.length > 0 && (
        <MessageList
          targetObjectType={targetObjectType}
          targetObject={targetObject}
          activeChannel={activeChannel}
          selfUser={selfUser}
          targetChannelId={targetChannelId}
        />
      )}
      {!(activeChannel?.messages?.length > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', height: '70%' }}>
          <div className={classes.firstMessagePlaceholder}>
            {targetObjectType.value === 'group' ? 'Create a group to start a chat within  ' : 'Start a chat with  '}
            {targetObjectType.value === 'user' || targetObjectType.value === 'group'
              ? targetObjectType.value
              : targetObjectType.value === 'instance'
              ? 'your current layer'
              : 'your current party'}
          </div>
        </div>
      )}
      <div style={{ position: 'fixed', bottom: '0' }}>
        <CreateMessage />
      </div>

      <InviteHarmony open={openInvite} handleClose={openInviteModel} />
    </div>
  )
}
