import { useState } from '@speigg/hookstate'
import React, { useEffect } from 'react'

import { useLocationInstanceConnectionState } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { ChatService, useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { getChatMessageSystem, removeMessageSystem } from '@xrengine/client-core/src/social/services/utils/chatSystem'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { isCommand } from '@xrengine/engine/src/common/functions/commandHandler'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { Cancel as CancelIcon, Message as MessageIcon, Send } from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'

import defaultStyles from './index.module.scss'

interface Props {
  styles?: any
  MessageButton?: any
  CloseButton?: any
  SendButton?: any
  newMessageLabel?: string
  setBottomDrawerOpen?: any
  animate?: any
  hideOtherMenus?: any
  setShowTouchPad?: any
}

const InstanceChat = (props: Props): any => {
  const {
    styles = defaultStyles,
    MessageButton = MessageIcon,
    CloseButton = CancelIcon,
    SendButton = Send,
    hideOtherMenus,
    setShowTouchPad,
    newMessageLabel = 'World Chat...'
  } = props

  let activeChannel: Channel | null = null
  const messageRefInput = React.useRef<HTMLInputElement>()
  const user = useAuthState().user
  const chatState = useChatState()
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const [composingMessage, setComposingMessage] = React.useState('')
  const [unreadMessages, setUnreadMessages] = React.useState(false)
  const activeChannelMatch = Object.entries(channels).find(([key, channel]) => channel.channelType === 'instance')
  const instanceConnectionState = useLocationInstanceConnectionState()

  const currentInstanceId = instanceConnectionState.currentInstanceId.value
  const currentInstanceConnection = instanceConnectionState.instances[currentInstanceId!]

  const [isInitRender, setIsInitRender] = React.useState<Boolean>()
  const [noUnReadMessage, setNoUnReadMessage] = React.useState<any>()
  const usersTyping = useState(
    getState(Engine.instance.currentWorld.store, WorldState).usersTyping[user?.id.value]
  ).value
  if (activeChannelMatch && activeChannelMatch.length > 0) {
    activeChannel = activeChannelMatch[1]
  }
  const sortedMessages =
    activeChannel &&
    activeChannel.messages &&
    [...activeChannel?.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const messageRef = React.useRef<any>()
  const messageEl = messageRef.current
  const isMobile = /Mobi/i.test(window.navigator.userAgent)
  useEffect(() => {
    if (!composingMessage || !usersTyping) return
    const delayDebounce = setTimeout(() => {
      dispatchAction(
        Engine.instance.currentWorld.store,
        NetworkWorldAction.setUserTyping({
          typing: false
        })
      )
    }, 3000)

    return () => clearTimeout(delayDebounce)
  }, [composingMessage])

  useEffect(() => {
    setIsInitRender(true)
  }, [])

  useEffect(() => {
    if (user?.instanceId?.value && currentInstanceId && user?.instanceId?.value !== currentInstanceId) {
      console.error(
        `[ERROR]: somehow user.instanceId and instanceConnectionState.instance.id, are different when they should be the same`
      )
      console.error(user?.instanceId?.value, currentInstanceId)
    }
    if (currentInstanceId && currentInstanceConnection.connected.value && !chatState.instanceChannelFetching.value) {
      ChatService.getInstanceChannel()
    }
  }, [currentInstanceConnection?.connected?.value, chatState.instanceChannelFetching.value])

  React.useEffect(() => {
    if (messageEl) messageEl.scrollTop = messageEl?.scrollHeight
  }, [chatState])

  React.useEffect(() => {
    if (sortedMessages && sortedMessages[sortedMessages.length - 1]?.senderId !== user?.id.value) {
      setNoUnReadMessage(false)
    }
  }, [chatState])

  const handleComposingMessageChange = (event: any): void => {
    const message = event.target.value
    if (message.length > composingMessage.length) {
      if (!usersTyping) {
        dispatchAction(
          Engine.instance.currentWorld.store,
          NetworkWorldAction.setUserTyping({
            typing: true
          })
        )
      }
    }
    if (message.length == 0 || message.length < composingMessage.length) {
      if (usersTyping) {
        dispatchAction(
          Engine.instance.currentWorld.store,
          NetworkWorldAction.setUserTyping({
            typing: false
          })
        )
      }
    }

    setComposingMessage(message)
  }

  const packageMessage = (): void => {
    if (composingMessage?.length && user.instanceId.value) {
      if (usersTyping) {
        dispatchAction(
          Engine.instance.currentWorld.store,
          NetworkWorldAction.setUserTyping({
            typing: false
          })
        )
      }

      ChatService.createMessage({
        targetObjectId: user.instanceId.value,
        targetObjectType: 'instance',
        text: composingMessage
      })
      setComposingMessage('')
    }
  }

  const [chatWindowOpen, setChatWindowOpen] = React.useState(false)
  const [isMultiline, setIsMultiline] = React.useState(false)
  const [cursorPosition, setCursorPosition] = React.useState(0)
  const toggleChatWindow = () => {
    if (!chatWindowOpen && isMobile) hideOtherMenus()
    setChatWindowOpen(!chatWindowOpen)
    chatWindowOpen && setUnreadMessages(false)
    setIsInitRender(false)
    setNoUnReadMessage(true)
  }
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  useEffect(() => {
    activeChannel &&
      activeChannel.messages &&
      activeChannel.messages.length > 0 &&
      !chatWindowOpen &&
      setUnreadMessages(true)
  }, [activeChannel?.messages])

  useEffect(() => {
    if (isMultiline) {
      ;(messageRefInput.current as HTMLInputElement).selectionStart = cursorPosition + 1
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

  const isLeftOrJoinText = (text) => {
    return / left the layer|joined the layer/.test(text)
  }

  return (
    <>
      <div
        onClick={() => {
          setChatWindowOpen(false)
          setNoUnReadMessage(true)
          if (isMobile) setShowTouchPad(true)
        }}
        className={styles['backdrop'] + ' ' + (!chatWindowOpen && styles['hideBackDrop'])}
      ></div>
      <div className={styles['instance-chat-container'] + ' ' + (!chatWindowOpen && styles['messageContainerClosed'])}>
        <div ref={messageRef} className={styles['instance-chat-msg-container']}>
          <div className={styles['list-container']}>
            <Card square={true} elevation={0} className={styles['message-wrapper']}>
              <CardContent className={styles['message-container']}>
                {sortedMessages &&
                  sortedMessages.map((message, index, messages) => {
                    if (isCommand(message.text)) return undefined
                    const system = getChatMessageSystem(message.text)
                    let chatMessage = message.text

                    if (system !== 'none') {
                      if (system === 'jl_system') {
                        chatMessage = removeMessageSystem(message.text)
                      } else {
                        return undefined
                      }
                    }
                    return (
                      <>
                        {!isLeftOrJoinText(message.text) ? (
                          <div key={message.id} className={`${styles.dFlex} ${styles.flexColumn} ${styles.mgSmall}`}>
                            {message.senderId !== user?.id.value && (
                              <div className={`${styles.selfEnd} ${styles.noMargin}`}>
                                <div className={styles.dFlex}>
                                  {index !== 0 && message.senderId !== messages[index - 1].senderId && (
                                    <Avatar src={message.sender?.avatarUrl} />
                                  )}
                                  {index === 0 && <Avatar src={message.sender?.avatarUrl} />}
                                  <div className={`${styles.msgContainer} ${styles.mx2}`}>
                                    <p className={styles.text}>{message.text}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {message.senderId === user?.id.value && (
                              <div className={`${styles.selfEnd} ${styles.noMargin}`}>
                                <div className={styles.dFlex}>
                                  <div className={`${styles.msgReplyContainer} ${styles.mx2}`}>
                                    <p className={styles.text}>{message.text}</p>
                                  </div>
                                  {index !== 0 && message.senderId !== messages[index - 1].senderId && (
                                    <Avatar src={message.sender?.avatarUrl} />
                                  )}
                                  {index === 0 && <Avatar src={message.sender?.avatarUrl} />}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div key={message.id} className={`${styles.selfEnd} ${styles.noMargin}`}>
                            <div className={styles.dFlex}>
                              <div className={`${styles.msgNotification} ${styles.mx2}`}>
                                <p className={styles.greyText}>{message.text}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })}
              </CardContent>
            </Card>
          </div>
        </div>
        <div
          className={`${styles['bottom-box']} ${!chatWindowOpen ? styles.bttm : ''} ${
            !chatWindowOpen ? styles.fixedPos : ''
          } ${chatWindowOpen ? styles.mgBtm : ''}`}
        >
          <div className={`${styles['chat-input']} ${chatWindowOpen ? '' : styles.invisible} `}>
            <Card className={styles['chat-view']} style={{ boxShadow: 'none' }}>
              <CardContent className={styles['chat-box']} style={{ boxShadow: 'none' }}>
                <TextField
                  className={styles.messageFieldContainer}
                  margin="normal"
                  multiline={true}
                  maxRows={10}
                  fullWidth
                  id="newMessage"
                  label={newMessageLabel}
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
                  inputRef={messageRefInput}
                  onClick={() => (messageRefInput as any)?.current?.focus()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.ctrlKey) {
                      e.preventDefault()
                      packageMessage()
                      setCursorPosition(0)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
          {unreadMessages && (
            <div
              className={`${styles.iconCallChat} ${
                isInitRender
                  ? props.animate
                  : !chatWindowOpen
                  ? isMobile
                    ? styles.animateTop
                    : styles.animateLeft
                  : ''
              } ${!chatWindowOpen ? '' : styles.iconCallPos}`}
            >
              <Badge
                color="primary"
                variant="dot"
                invisible={noUnReadMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <Fab className={styles.chatBadge} color="primary" onClick={() => toggleChatWindow()}>
                  {!chatWindowOpen ? (
                    <MessageButton />
                  ) : (
                    <CloseButton
                      onClick={() => {
                        toggleChatWindow()
                        if (isMobile) setShowTouchPad(true)
                      }}
                    />
                  )}
                </Fab>
              </Badge>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default InstanceChat
