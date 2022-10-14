import { useHookstate } from '@hookstate/core'
import React, { Fragment, useEffect, useRef, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'

import { useLocationInstanceConnectionState } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { ChatService, ChatServiceReceptor, useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import multiLogger from '@xrengine/common/src/logger'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineState, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { addActionReceptor, dispatchAction, removeActionReceptor } from '@xrengine/hyperflux'
import { getState } from '@xrengine/hyperflux'

import { Close as CloseIcon, Message as MessageIcon, Send } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'

import { AppAction } from '../../common/services/AppService'
import { getAvatarURLForUser } from '../../user/components/UserMenu/util'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import defaultStyles from './index.module.scss'
import styles from './index.module.scss'

const logger = multiLogger.child({ component: 'client-core:chat' })

interface ChatHooksProps {
  chatWindowOpen: boolean
  setUnreadMessages: Function
  messageRefInput: React.MutableRefObject<HTMLInputElement>
}

export const useChatHooks = ({ chatWindowOpen, setUnreadMessages, messageRefInput }: ChatHooksProps) => {
  /**
   * Provisioning logic
   */

  const locationInstanceConnectionState = useLocationInstanceConnectionState()
  const currentInstanceConnection =
    locationInstanceConnectionState.instances[Engine.instance.currentWorld.worldNetwork?.hostId]

  useEffect(() => {
    if (Engine.instance.currentWorld.worldNetwork?.hostId && currentInstanceConnection?.connected?.value) {
      ChatService.getInstanceChannel()
    }
  }, [currentInstanceConnection?.connected?.value])

  /**
   * Message display logic
   */

  const chatState = useChatState()
  const channels = chatState.channels.channels
  const activeChannel = Object.values(channels).find((channel) => channel.channelType.value === 'instance')

  useEffect(() => {
    if (activeChannel?.messages?.length && !chatWindowOpen) setUnreadMessages(true)
  }, [activeChannel?.messages])

  /**
   * Message composition logic
   */

  const [composingMessage, setComposingMessage] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const user = useAuthState().user
  const usersTyping = useEngineState().usersTyping[user?.id.value].value
  const [isMultiline, setIsMultiline] = useState(false)

  useEffect(() => {
    if (isMultiline) {
      ;(messageRefInput.current as HTMLInputElement).selectionStart = cursorPosition + 1
    }
  }, [isMultiline])

  useEffect(() => {
    if (!composingMessage || !usersTyping) return
    const delayDebounce = setTimeout(() => {
      dispatchAction(
        WorldNetworkAction.setUserTyping({
          typing: false
        })
      )
    }, 3000)

    return () => clearTimeout(delayDebounce)
  }, [composingMessage])

  const handleComposingMessageChange = (event: any): void => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      const selectionStart = (event.target as HTMLInputElement).selectionStart

      setComposingMessage(
        composingMessage.substring(0, selectionStart || 0) + '\n' + composingMessage.substring(selectionStart || 0)
      )
      return
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      packageMessage()
      return
    }

    const message = event.target.value
    if (message.length > composingMessage.length) {
      if (!usersTyping) {
        dispatchAction(
          WorldNetworkAction.setUserTyping({
            typing: true
          })
        )
      }
    }
    if (message.length == 0 || message.length < composingMessage.length) {
      if (usersTyping) {
        dispatchAction(
          WorldNetworkAction.setUserTyping({
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
          WorldNetworkAction.setUserTyping({
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

    setCursorPosition(0)
  }

  /**
   * Chat panel dimensions
   */

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

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

  return {
    dimensions,
    activeChannel,
    handleComposingMessageChange,
    packageMessage,
    composingMessage
  }
}

interface InstanceChatProps {
  styles?: any
  MessageButton?: any
  CloseButton?: any
  newMessageLabel?: string
}

export const InstanceChat = ({
  styles = defaultStyles,
  MessageButton = MessageIcon,
  CloseButton = CloseIcon,
  newMessageLabel = 'World Chat...'
}: InstanceChatProps): any => {
  const [chatWindowOpen, setChatWindowOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(false)
  const [messageContainerVisible, setMessageContainerVisible] = useState(false)
  const messageRefInput = useRef<HTMLInputElement>()

  const { activeChannel, handleComposingMessageChange, packageMessage, composingMessage } = useChatHooks({
    chatWindowOpen,
    setUnreadMessages,
    messageRefInput: messageRefInput as any
  })

  const sortedMessages = activeChannel?.messages?.get({ noproxy: true })?.length
    ? [...activeChannel.messages.get({ noproxy: true })].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : []

  const user = useAuthState().user

  const [isInitRender, setIsInitRender] = useState<Boolean>()

  const isMobile = /Mobi/i.test(window.navigator.userAgent)
  const chatState = useChatState()

  // TODO: move to register event for chat widget
  ChatService.useAPIListeners()
  useEffect(() => {
    addActionReceptor(ChatServiceReceptor)
    return () => {
      removeActionReceptor(ChatServiceReceptor)
    }
  }, [])

  /**
   * Audio effect
   */
  useEffect(() => {
    const message = sortedMessages[sortedMessages.length - 1]
    if (!message) return
    AudioEffectPlayer.instance.play(
      message.isNotification ? AudioEffectPlayer.SOUNDS.notification : AudioEffectPlayer.SOUNDS.message
    )
  }, [chatState.messageCreated])

  const messageRef = useRef<any>()

  useEffect(() => {
    if (
      sortedMessages?.length &&
      sortedMessages[sortedMessages.length - 1]?.senderId !== user?.id.value &&
      chatState.messageCreated.value
    ) {
      setUnreadMessages(true)
    }

    const messageRefCurrentRenderedInterval = setInterval(() => {
      if (messageRef.current && messageRef.current.scrollHeight > 0) {
        messageRef.current.scrollTop = messageRef.current.scrollHeight
        clearInterval(messageRefCurrentRenderedInterval)
      }
    }, 5000)
  }, [chatState.messageCreated])

  const hideOtherMenus = () => {
    dispatchAction(AppAction.showTopShelf({ show: false }))
    dispatchAction(AppAction.showBottomShelf({ show: false }))
    dispatchAction(AppAction.showTouchPad({ show: false }))
  }

  const toggleChatWindow = () => {
    if (!chatWindowOpen && isMobile) hideOtherMenus()
    if (!chatWindowOpen) {
      setMessageContainerVisible(false)
      const messageRefCurrentRenderedInterval = setInterval(() => {
        if (messageRef.current && messageRef.current.scrollHeight > 0) {
          messageRef.current.scrollTop = messageRef.current.scrollHeight
          setMessageContainerVisible(true)
          clearInterval(messageRefCurrentRenderedInterval)
        }
      }, 5000)
    }
    setChatWindowOpen(!chatWindowOpen)
    chatWindowOpen && setUnreadMessages(false)
    setIsInitRender(false)
  }

  const userAvatarDetails = useHookstate(getState(WorldState).userAvatarDetails)

  return (
    <>
      <div
        onClick={() => {
          setChatWindowOpen(false)
          setUnreadMessages(false)
          dispatchAction(AppAction.showTouchPad({ show: true }))
        }}
        className={styles.backdrop + ' ' + (!chatWindowOpen ? styles.hideBackDrop : '')}
      ></div>
      <div className={styles['instance-chat-container'] + ' ' + (chatWindowOpen ? styles.open : '')}>
        {chatWindowOpen && (
          <div
            ref={messageRef}
            className={styles['instance-chat-msg-container'] + ' ' + (!messageContainerVisible ? styles.hidden : '')}
          >
            <div className={styles.scrollFix} />
            {sortedMessages &&
              sortedMessages.map((message, index, messages) => (
                <Fragment key={message.id}>
                  {message.isNotification ? (
                    <div key={message.id} className={`${styles.selfEnd} ${styles.noMargin}`}>
                      <div className={styles.dFlex}>
                        <div className={`${styles.msgNotification} ${styles.mx2}`}>
                          <p className={styles.shadowText}>{message.text}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className={`${styles.dFlex} ${styles.flexColumn} ${styles.mgSmall}`}>
                      <div className={`${styles.selfEnd} ${styles.noMargin}`}>
                        <div
                          className={`${
                            message.senderId !== user?.id.value ? styles.msgReplyContainer : styles.msgOwner
                          } ${styles.msgContainer} ${styles.dFlex}`}
                        >
                          <div className={styles.msgWrapper}>
                            {messages[index - 1] && messages[index - 1].isNotification ? (
                              <h3 className={styles.sender}>{message.sender.name}</h3>
                            ) : (
                              messages[index - 1] &&
                              message.senderId !== messages[index - 1].senderId && (
                                <h3 className={styles.sender}>{message.sender.name}</h3>
                              )
                            )}
                            <p className={styles.text}>{message.text}</p>
                          </div>
                          {index !== 0 && messages[index - 1] && messages[index - 1].isNotification ? (
                            <Avatar
                              src={getAvatarURLForUser(userAvatarDetails, message.senderId)}
                              className={styles.avatar}
                            />
                          ) : (
                            messages[index - 1] &&
                            message.senderId !== messages[index - 1].senderId && (
                              <Avatar
                                src={getAvatarURLForUser(userAvatarDetails, message.senderId)}
                                className={styles.avatar}
                              />
                            )
                          )}
                          {index === 0 && (
                            <Avatar
                              src={getAvatarURLForUser(userAvatarDetails, message.senderId)}
                              className={styles.avatar}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Fragment>
              ))}
          </div>
        )}
        <div className={`${styles['bottom-box']}`}>
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
                  value={composingMessage}
                  inputProps={{
                    maxLength: 1000,
                    'aria-label': 'naked'
                  }}
                  InputLabelProps={{ shrink: false }}
                  onChange={handleComposingMessageChange}
                  inputRef={messageRefInput}
                  onClick={() => (messageRefInput as any)?.current?.focus()}
                  onKeyDown={(evt) => handleComposingMessageChange(evt)}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="send message"
                        onClick={packageMessage}
                        className={styles.sendButton}
                        focusRipple={false}
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div
            className={`${styles.iconCallChat} ${
              isInitRender
                ? styles.animateBottom
                : !chatWindowOpen
                ? isMobile
                  ? styles.animateTop
                  : styles.animateLeft
                : ''
            } ${!chatWindowOpen ? '' : styles.chatOpen}`}
          >
            <Badge
              color="primary"
              variant="dot"
              invisible={!unreadMessages}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <Fab
                id="openMessagesButton"
                className={styles.chatBadge}
                color="primary"
                onClick={() => toggleChatWindow()}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              >
                {!chatWindowOpen ? (
                  <MessageButton />
                ) : (
                  <CloseButton
                    onClick={() => {
                      toggleChatWindow()
                      dispatchAction(AppAction.showTouchPad({ show: true }))
                    }}
                  />
                )}
              </Fab>
            </Badge>
          </div>
        </div>
      </div>
    </>
  )
}

export const InstanceChatWrapper = () => {
  const engineState = useHookstate(getState(EngineState))
  const { t } = useTranslation()
  const { bottomShelfStyle } = useShelfStyles()
  return (
    <>
      {engineState.connectedWorld.value ? (
        <div className={bottomShelfStyle}>
          <InstanceChat />
        </div>
      ) : (
        <div className={styles.modalConnecting}>
          <div className={styles.modalConnectingTitle}>
            <p>{t('common:loader.connectingToWorld')}</p>
          </div>
        </div>
      )}
    </>
  )
}
