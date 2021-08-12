import Avatar from '@material-ui/core/Avatar'
import Badge from '@material-ui/core/Badge'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Fab from '@material-ui/core/Fab'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'
import { Message as MessageIcon, Send } from '@material-ui/icons'
import { selectChatState } from '@xrengine/client-core/src/social/reducers/chat/selector'
import {
  createMessage,
  getInstanceChannel,
  updateChatTarget,
  updateMessageScrollInit
} from '@xrengine/client-core/src/social/reducers/chat/service'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { User } from '@xrengine/common/src/interfaces/User'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectInstanceConnectionState } from '../../reducers/instanceConnection/selector'
// @ts-ignore
import styles from './InstanceChat.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    chatState: selectChatState(state),
    instanceConnectionState: selectInstanceConnectionState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getInstanceChannel: bindActionCreators(getInstanceChannel, dispatch),
  createMessage: bindActionCreators(createMessage, dispatch),
  updateChatTarget: bindActionCreators(updateChatTarget, dispatch),
  updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
})

interface Props {
  authState?: any
  setBottomDrawerOpen: any
  chatState?: any
  instanceConnectionState?: any
  getInstanceChannel?: any
  createMessage?: any
  updateChatTarget?: any
  updateMessageScrollInit?: any
}

const InstanceChat = (props: Props): any => {
  const {
    authState,
    chatState,
    instanceConnectionState,
    getInstanceChannel,
    createMessage,
    setBottomDrawerOpen,
    updateChatTarget,
    updateMessageScrollInit
  } = props

  let activeChannel
  const messageRef = React.useRef<HTMLInputElement>()
  const user = authState.get('user') as User
  const channelState = chatState.get('channels')
  const channels = channelState.get('channels')
  const [composingMessage, setComposingMessage] = useState('')
  const [unreadMessages, setUnreadMessages] = useState(false)
  const activeChannelMatch = [...channels].find(([, channel]) => channel.channelType === 'instance')
  if (activeChannelMatch && activeChannelMatch.length > 0) {
    activeChannel = activeChannelMatch[1]
  }

  useEffect(() => {
    if (instanceConnectionState.get('connected') === true && channelState.get('fetchingInstanceChannel') !== true) {
      getInstanceChannel()
    }
  }, [instanceConnectionState])

  const openBottomDrawer = (e: any): void => {
    setBottomDrawerOpen(true)
  }

  const handleComposingMessageChange = (event: any): void => {
    const message = event.target.value
    setComposingMessage(message)
  }

  const packageMessage = (): void => {
    if (composingMessage.length > 0) {
      createMessage({
        targetObjectId: user.instanceId,
        targetObjectType: 'instance',
        text: composingMessage
      })
      setComposingMessage('')
    }
  }

  const setActiveChat = (channel): void => {
    updateMessageScrollInit(true)
    const channelType = channel.channelType
    const target =
      channelType === 'user'
        ? channel.user1?.id === user.id
          ? channel.user2
          : channel.user2?.id === user.id
          ? channel.user1
          : {}
        : channelType === 'group'
        ? channel.group
        : channelType === 'instance'
        ? channel.instance
        : channel.party
    updateChatTarget(channelType, target, channel.id)
    setComposingMessage('')
  }

  const [openMessageContainer, setOpenMessageContainer] = React.useState(false)
  const [isMultiline, setIsMultiline] = React.useState(false)
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const hideShowMessagesContainer = () => {
    setOpenMessageContainer(!openMessageContainer)
    openMessageContainer && setUnreadMessages(false)
  }
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  const getMessageUser = (message): string => {
    let returned = message.sender?.name
    if (message.senderId === user.id) returned += ' (you)'
    //returned += ': '
    return returned
  }

  const isMessageSentBySelf = (message): boolean => {
    return message.senderId === user.id
  }

  useEffect(() => {
    activeChannel &&
      activeChannel.messages &&
      activeChannel.messages.length > 0 &&
      !openMessageContainer &&
      setUnreadMessages(true)
  }, [activeChannel?.messages])

  useEffect(() => {
    if (isMultiline) {
      ;(messageRef.current as HTMLInputElement).selectionStart = cursorPosition + 1
    }
  }, [isMultiline])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const handleWindowResize = () => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth
    })
  }

  const getAvatar = (message): any => {
    return (
      dimensions.width > 768 && (
        <ListItemAvatar className={styles['message-sender-avatar']}>
          <Avatar src={message.sender?.avatarUrl} />
        </ListItemAvatar>
      )
    )
  }

  return (
    <>
      <div
        className={
          styles['instance-chat-container'] + ' ' + (!openMessageContainer && styles['messageContainerClosed'])
        }
      >
        <div className={styles['list-container']}>
          <Card square={true} elevation={0} className={styles['message-wrapper']}>
            <CardContent className={styles['message-container']}>
              {activeChannel != null &&
                activeChannel.messages &&
                activeChannel.messages
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .slice(
                    activeChannel.messages.length >= 3 ? activeChannel.messages?.length - 3 : 0,
                    activeChannel.messages?.length
                  )
                  .map((message) => {
                    return (
                      <ListItem
                        className={classNames({
                          [styles.message]: true,
                          [styles.self]: isMessageSentBySelf(message),
                          [styles.other]: !isMessageSentBySelf(message)
                        })}
                        disableGutters={true}
                        key={message.id}
                      >
                        <div className={styles[isMessageSentBySelf(message) ? 'message-right' : 'message-left']}>
                          {!isMessageSentBySelf(message) && getAvatar(message)}

                          <ListItemText
                            className={
                              styles[isMessageSentBySelf(message) ? 'message-right-text' : 'message-left-text']
                            }
                            primary={
                              <span>
                                <span className={styles.userName} color="primary">
                                  {getMessageUser(message)}
                                </span>
                                <p>{message.text}</p>
                              </span>
                            }
                          />

                          {isMessageSentBySelf(message) && getAvatar(message)}
                        </div>
                      </ListItem>
                    )
                  })}
            </CardContent>
          </Card>
          <Card className={styles[('flex-center', 'chat-view')]}>
            <CardContent className={styles['chat-box']}>
              <div className={styles.iconContainer}>
                <MessageIcon onClick={() => hideShowMessagesContainer()} />
              </div>
              <TextField
                className={styles.messageFieldContainer}
                margin="normal"
                multiline={isMultiline}
                fullWidth
                id="newMessage"
                label="World Chat..."
                name="newMessage"
                autoFocus
                value={composingMessage}
                inputProps={{
                  maxLength: 1000,
                  'aria-label': 'naked'
                }}
                InputLabelProps={{ shrink: false }}
                onChange={handleComposingMessageChange}
                inputRef={messageRef}
                onClick={() => (messageRef as any)?.current?.focus()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault()
                    const selectionStart = (e.target as HTMLInputElement).selectionStart
                    setCursorPosition(selectionStart)
                    setComposingMessage(
                      composingMessage.substring(0, selectionStart) + '\n' + composingMessage.substring(selectionStart)
                    )
                    !isMultiline && setIsMultiline(true)
                  } else if (e.key === 'Enter' && !e.ctrlKey) {
                    e.preventDefault()
                    packageMessage()
                    isMultiline && setIsMultiline(false)
                    setCursorPosition(0)
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                className={classNames({ [styles.iconContainerSend]: true, sendMessage: true })}
                onClick={packageMessage}
              >
                <Send />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {!openMessageContainer && (
        <div className={styles.iconCallChat}>
          <Badge
            color="primary"
            variant="dot"
            invisible={!unreadMessages}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Fab
              className={styles[('openChat', 'chatBadge')]}
              color="primary"
              onClick={() => hideShowMessagesContainer()}
            >
              <MessageIcon />
            </Fab>
          </Badge>
        </div>
      )}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(InstanceChat)
