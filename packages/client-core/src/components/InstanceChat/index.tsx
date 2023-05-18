import React, { Fragment, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useWorldInstance } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { ChatService, ChatState } from '@etherealengine/client-core/src/social/services/ChatService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Avatar from '@etherealengine/ui/src/Avatar'
import Badge from '@etherealengine/ui/src/Badge'
import Card from '@etherealengine/ui/src/Card'
import CardContent from '@etherealengine/ui/src/CardContent'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import TextField from '@etherealengine/ui/src/TextField'

import { Close as CloseIcon, Message as MessageIcon } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

import { AppAction } from '../../common/services/AppService'
import { getAvatarURLForUser } from '../../user/components/UserMenu/util'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import defaultStyles from './index.module.scss'
import styles from './index.module.scss'

interface ChatHooksProps {
  chatWindowOpen: boolean
  setUnreadMessages: Function
  messageRefInput: React.MutableRefObject<HTMLInputElement>
}

export const useChatHooks = ({ chatWindowOpen, setUnreadMessages, messageRefInput }: ChatHooksProps) => {
  /**
   * Provisioning logic
   */
  const currentInstanceConnection = useWorldInstance()

  useEffect(() => {
    if (Engine.instance.worldNetwork?.hostId && currentInstanceConnection?.connected?.value) {
      ChatService.getInstanceChannel()
    }
  }, [currentInstanceConnection?.connected])

  /**
   * Message display logic
   */

  const chatState = useHookstate(getMutableState(ChatState))
  const channels = chatState.channels.channels
  const activeChannel = Object.values(channels).find((channel) => channel.channelType.value === 'instance')

  useEffect(() => {
    if (activeChannel?.messages?.length && !chatWindowOpen) setUnreadMessages(true)
  }, [activeChannel?.messages])

  /**
   * Message composition logic
   */

  const composingMessage = useHookstate('')
  const cursorPosition = useHookstate(0)
  const user = useHookstate(getMutableState(AuthState).user)
  const usersTyping = useHookstate(getMutableState(EngineState)).usersTyping[user?.id.value].value
  const isMultiline = useHookstate(false)

  useEffect(() => {
    if (isMultiline.value) {
      ;(messageRefInput.current as HTMLInputElement).selectionStart = cursorPosition.value + 1
    }
  }, [isMultiline.value])

  useEffect(() => {
    if (!composingMessage.value || !usersTyping) return
    const delayDebounce = setTimeout(() => {
      dispatchAction(
        WorldNetworkAction.setUserTyping({
          typing: false
        })
      )
    }, 3000)

    return () => clearTimeout(delayDebounce)
  }, [composingMessage.value])

  const handleComposingMessageChange = (event: any): void => {
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
      packageMessage()
      return
    }

    const message = event.target.value
    if (message.length > composingMessage.value.length) {
      if (!usersTyping) {
        dispatchAction(
          WorldNetworkAction.setUserTyping({
            typing: true
          })
        )
      }
    }
    if (message.length == 0 || message.length < composingMessage.value.length) {
      if (usersTyping) {
        dispatchAction(
          WorldNetworkAction.setUserTyping({
            typing: false
          })
        )
      }
    }

    composingMessage.set(message)
  }

  const packageMessage = (): void => {
    const instanceId = Engine.instance.worldNetwork.hostId
    if (composingMessage?.value?.length && instanceId) {
      if (usersTyping) {
        dispatchAction(
          WorldNetworkAction.setUserTyping({
            typing: false
          })
        )
      }

      ChatService.createMessage({
        targetObjectId: instanceId,
        targetObjectType: 'instance',
        text: composingMessage.value
      })
      composingMessage.set('')
    }

    cursorPosition.set(0)
  }

  /**
   * Chat panel dimensions
   */

  const dimensions = useHookstate({
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
    dimensions.set({
      height: window.innerHeight,
      width: window.innerWidth
    })
  }

  return {
    dimensions: dimensions.get({ noproxy: true }),
    activeChannel,
    handleComposingMessageChange,
    packageMessage,
    composingMessage: composingMessage.value
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
  const chatWindowOpen = useHookstate(false)
  const unreadMessages = useHookstate(false)
  const messageContainerVisible = useHookstate(false)
  const messageRefInput = useRef<HTMLInputElement>()

  const { activeChannel, handleComposingMessageChange, packageMessage, composingMessage } = useChatHooks({
    chatWindowOpen: chatWindowOpen.value,
    setUnreadMessages: unreadMessages.set,
    messageRefInput: messageRefInput as any
  })

  const sortedMessages = activeChannel?.messages?.get({ noproxy: true })?.length
    ? [...activeChannel.messages.get({ noproxy: true })].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : []

  const user = useHookstate(getMutableState(AuthState).user)

  const isInitRender = useHookstate<Boolean>(false)

  const isMobile = /Mobi/i.test(window.navigator.userAgent)
  const chatState = useHookstate(getMutableState(ChatState))

  /**
   * Audio effect
   */
  useEffect(() => {
    const message = sortedMessages[sortedMessages.length - 1]
    if (!message) return
    AudioEffectPlayer.instance.play(
      message.isNotification ? AudioEffectPlayer.SOUNDS.notification : AudioEffectPlayer.SOUNDS.message
    )
  }, [chatState.messageCreated.value])

  const messageRef = useRef<any>()

  useEffect(() => {
    if (
      sortedMessages?.length &&
      sortedMessages[sortedMessages.length - 1]?.senderId !== user?.id.value &&
      chatState.messageCreated.value
    ) {
      unreadMessages.set(true)
    }

    const messageRefCurrentRenderedInterval = setInterval(() => {
      if (messageRef.current && messageRef.current.scrollHeight > 0) {
        messageRef.current.scrollTop = messageRef.current.scrollHeight
        clearInterval(messageRefCurrentRenderedInterval)
      }
    }, 500)
  }, [chatState.messageCreated.value])

  const hideOtherMenus = () => {
    dispatchAction(AppAction.showTopShelf({ show: false }))
    dispatchAction(AppAction.showBottomShelf({ show: false }))
    dispatchAction(AppAction.showTouchPad({ show: false }))
  }

  const toggleChatWindow = () => {
    if (!chatWindowOpen.value && isMobile) hideOtherMenus()
    if (!chatWindowOpen.value) {
      messageContainerVisible.set(false)
      const messageRefCurrentRenderedInterval = setInterval(() => {
        if (messageRef.current && messageRef.current.scrollHeight > 0) {
          messageRef.current.scrollTop = messageRef.current.scrollHeight
          messageContainerVisible.set(true)
          clearInterval(messageRefCurrentRenderedInterval)
        }
      }, 500)
    }
    chatWindowOpen.set(!chatWindowOpen.value)
    chatWindowOpen.value && unreadMessages.set(false)
    isInitRender.set(false)
  }

  const userAvatarDetails = useHookstate(getMutableState(WorldState).userAvatarDetails)

  return (
    <>
      <div
        onClick={() => {
          chatWindowOpen.set(false)
          unreadMessages.set(false)
          dispatchAction(AppAction.showTouchPad({ show: true }))
        }}
        className={styles.backdrop + ' ' + (!chatWindowOpen.value ? styles.hideBackDrop : '')}
      ></div>
      <div className={styles['instance-chat-container'] + ' ' + (chatWindowOpen.value ? styles.open : '')}>
        {chatWindowOpen.value && (
          <div
            ref={messageRef}
            className={
              styles['instance-chat-msg-container'] + ' ' + (!messageContainerVisible.value ? styles.hidden : '')
            }
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
          <div className={`${styles['chat-input']} ${chatWindowOpen.value ? '' : styles.invisible} `}>
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
                        icon={<Icon type="Send" fontSize="small" />}
                      />
                    )
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div
            className={`${styles.iconCallChat} ${
              isInitRender.value
                ? styles.animateBottom
                : !chatWindowOpen.value
                ? isMobile
                  ? styles.animateTop
                  : styles.animateLeft
                : ''
            } ${!chatWindowOpen.value ? '' : styles.chatOpen}`}
          >
            <Badge
              color="primary"
              variant="dot"
              invisible={!unreadMessages.value}
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
                {!chatWindowOpen.value ? (
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
  const engineState = useHookstate(getMutableState(EngineState))
  const { t } = useTranslation()
  const { bottomShelfStyle } = useShelfStyles()
  return (
    <>
      {engineState.connectedWorld.value ? (
        <div className={`${bottomShelfStyle} ${styles.chatRoot}`}>
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
