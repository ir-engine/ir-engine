import { createState } from '@speigg/hookstate'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

import { useLocationInstanceConnectionState } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { ChatService, useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { getChatMessageSystem, removeMessageSystem } from '@xrengine/client-core/src/social/services/utils/chatSystem'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { isCommand } from '@xrengine/engine/src/common/functions/commandHandler'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI, XRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { Close as CloseIcon, Message as MessageIcon, Send } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Fab from '@mui/material/Fab'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'

import styles from '../../components/InstanceChat/InstanceChat.module.scss'

export function createChatDetailView() {
  return createXRUI(ChatDetailView, createChatDetailState())
}

function createChatDetailState() {
  return createState({
    chatWindowOpen: false
  })
}

type ChatDetailState = ReturnType<typeof createChatDetailState>

const ChatDetailView = () => {
  const detailState = useXRUIState() as ChatDetailState

  let activeChannel: Channel | null = null
  const dispatch = useDispatch()
  const messageRef = React.useRef<HTMLInputElement>()
  const user = useAuthState().user
  const chatState = useChatState()
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const [composingMessage, setComposingMessage] = useState('')
  const [unreadMessages, setUnreadMessages] = useState(false)
  const activeChannelMatch = Object.entries(channels).find(([key, channel]) => channel.channelType === 'instance')
  const instanceConnectionState = useLocationInstanceConnectionState()
  if (activeChannelMatch && activeChannelMatch.length > 0) {
    activeChannel = activeChannelMatch[1]
  }

  useEffect(() => {
    if (
      user?.instanceId?.value &&
      instanceConnectionState.instance.id?.value &&
      user?.instanceId?.value !== instanceConnectionState.instance.id?.value
    ) {
      console.warn(
        '[WARNING]: somehow user.instanceId and instanceConnectionState.instance.id, are different when they should be the same'
      )
      console.log(user?.instanceId?.value, instanceConnectionState.instance.id?.value)
    }
    if (
      instanceConnectionState.instance.id?.value &&
      instanceConnectionState.connected.value &&
      !chatState.instanceChannelFetching.value
    ) {
      ChatService.getInstanceChannel()
    }
  }, [
    instanceConnectionState.instance.id?.value,
    instanceConnectionState.connected?.value,
    chatState.instanceChannelFetching.value
  ])

  const handleComposingMessageChange = (event: any): void => {
    const message = event.target.value
    setComposingMessage(message)
  }

  const packageMessage = (): void => {
    if (composingMessage?.length && user.instanceId.value) {
      ChatService.createMessage({
        targetObjectId: user.instanceId.value,
        targetObjectType: 'instance',
        text: composingMessage
      })
      setComposingMessage('')
    }
  }

  //const [chatWindowOpen, setChatWindowOpen] = React.useState(false)
  const [isMultiline, setIsMultiline] = React.useState(false)
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const toggleChatWindow = () => {
    detailState.chatWindowOpen.set(!detailState.chatWindowOpen.value)
    detailState.chatWindowOpen.value && setUnreadMessages(false)
  }
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  const getMessageUser = (message): string => {
    let returned = message.sender?.name
    if (message.senderId === user.id.value) returned += ' (you)'
    //returned += ': '
    return returned
  }

  const isMessageSentBySelf = (message): boolean => {
    return message.senderId === user.id.value
  }

  useEffect(() => {
    activeChannel &&
      activeChannel.messages &&
      activeChannel.messages.length > 0 &&
      !detailState.chatWindowOpen.value &&
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
        <ListItemAvatar style={{ width: '20px', height: '20px', margin: '0 10px', minWidth: 'auto' }}>
          <Avatar src={message.sender?.avatarUrl} />
        </ListItemAvatar>
      )
    )
  }

  return (
    <>
      <div
        style={{
          margin: '5px 20px 10px 10px',
          borderRadius: '5px',

          backgroundColor: '#9a9ae4',
          width: '40vw',
          ...((!detailState.chatWindowOpen.value ? { width: '0', overflow: 'hidden' } : {}) as {})
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            square={true}
            elevation={0}
            style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}
          >
            <CardContent
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                height: '100%',
                background: 'transparent'
              }}
            >
              {activeChannel &&
                activeChannel.messages &&
                [...activeChannel.messages]
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .slice(
                    activeChannel.messages.length >= 3 ? activeChannel.messages?.length - 3 : 0,
                    activeChannel.messages?.length
                  )
                  .map((message) => {
                    if (!Engine.isBot && isCommand(message.text)) return undefined
                    const system = getChatMessageSystem(message.text)
                    let chatMessage = message.text

                    if (system !== 'none') {
                      if (Engine.isBot || system === 'jl_system') {
                        chatMessage = removeMessageSystem(message.text)
                      } else {
                        return undefined
                      }
                    }
                    return (
                      <div
                        style={{
                          color: 'white',
                          padding: '10px',
                          ...(isMessageSentBySelf(message)
                            ? { width: '100%', display: 'flex' }
                            : { width: '60%', display: 'flex' })
                        }}
                      >
                        <div
                          style={
                            isMessageSentBySelf(message)
                              ? { justifyContent: 'flex-end', textAlign: 'end' }
                              : { justifyContent: 'flex-start', textAlign: 'start' }
                          }
                        >
                          {!isMessageSentBySelf(message) && getAvatar(message)}

                          <ListItemText
                            style={
                              isMessageSentBySelf(message)
                                ? { borderRadius: '10px 10px 0' }
                                : { borderRadius: '10px 10px 10px 0' }
                            }
                            primary={
                              <span
                                style={
                                  isMessageSentBySelf(message)
                                    ? { justifyContent: 'flex-end', textAlign: 'end' }
                                    : { justifyContent: 'flex-start', textAlign: 'start' }
                                }
                              >
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{getMessageUser(message)}</span>
                                <p>{chatMessage}</p>
                              </span>
                            }
                          />

                          {isMessageSentBySelf(message) && getAvatar(message)}
                        </div>
                      </div>
                    )
                  })}
            </CardContent>
          </Card>
          <Card style={{ borderRadius: '40px', background: 'transparent', boxShadow: 'none' }}>
            <CardContent
              style={{ display: 'flex', flexGrow: '1', padding: '0', alignItems: 'flex-end', boxShadow: 'none' }}
            >
              <TextField
                style={{ margin: '0', padding: '0 0px 0 10px', width: '100%' }}
                margin="normal"
                multiline={isMultiline}
                fullWidth
                id="newMessage"
                label={'World Chat...'}
                name="newMessage"
                variant="standard"
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
                    setCursorPosition(selectionStart || 0)
                    setComposingMessage(
                      composingMessage.substring(0, selectionStart || 0) +
                        '\n' +
                        composingMessage.substring(selectionStart || 0)
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
              {/*<span className={styles.sendButton}>
                <SendButton onClick={packageMessage} />
              </span>*/}
            </CardContent>
          </Card>
        </div>
      </div>
      {
        <div
          style={{
            margin: '5px 15px 20px 10px',
            alignItems: 'center',
            color: '#000',
            zIndex: '20'
          }}
        >
          <Badge
            color="primary"
            variant="dot"
            invisible={!unreadMessages}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Fab
              style={{ borderRadius: '50%', color: 'black', width: '50px', height: '50px' }}
              color="primary"
              onClick={() => toggleChatWindow()}
            >
              {!detailState.chatWindowOpen.value ? (
                <MessageIcon onClick={() => toggleChatWindow()} />
              ) : (
                <CloseIcon onClick={() => toggleChatWindow()} />
              )}
            </Fab>
          </Badge>
        </div>
      }
    </>
  )
}
