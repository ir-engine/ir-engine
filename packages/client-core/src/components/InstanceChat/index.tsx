import { Downgraded, useHookstate } from '@hookstate/core'
import React, { Fragment, useEffect, useRef, useState } from 'react'

import { useLocationInstanceConnectionState } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { ChatService, ChatServiceReceptor, useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { notificationAlertURL } from '@xrengine/common/src/constants/URL'
import multiLogger from '@xrengine/common/src/logger'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { useAudioState } from '@xrengine/engine/src/audio/AudioState'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { EngineActions, getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import UpdateableObject3D from '@xrengine/engine/src/scene/classes/UpdateableObject3D'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { SCENE_COMPONENT_AUDIO_DEFAULT_VALUES } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'
import { updateAudio } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'
import { SCENE_COMPONENT_MEDIA_DEFAULT_VALUES } from '@xrengine/engine/src/scene/functions/loaders/MediaFunctions'
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

import { getAvatarURLForUser } from '../../user/components/UserMenu/util'
import defaultStyles from './index.module.scss'

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

  const chatState = useChatState().attach(Downgraded).value
  const channels = chatState.channels.channels
  const activeChannelMatch = Object.values(channels).find((channel) => channel.channelType === 'instance')
  const activeChannel = activeChannelMatch?.messages ? activeChannelMatch.messages : []
  const sortedMessages = [...activeChannel].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  useEffect(() => {
    if (activeChannel?.length > 0 && !chatWindowOpen) setUnreadMessages(true)
  }, [activeChannel])

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
    sortedMessages,
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
  setBottomDrawerOpen?: any
  animate?: any
  hideOtherMenus?: any
  setShowTouchPad?: any
}

const InstanceChat = ({
  styles = defaultStyles,
  MessageButton = MessageIcon,
  CloseButton = CloseIcon,
  newMessageLabel = 'World Chat...',
  animate,
  hideOtherMenus,
  setShowTouchPad
}: InstanceChatProps): any => {
  const [chatWindowOpen, setChatWindowOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(false)
  const [messageContainerVisible, setMessageContainerVisible] = useState(false)
  const messageRefInput = useRef<HTMLInputElement>()

  const { dimensions, sortedMessages, handleComposingMessageChange, packageMessage, composingMessage } = useChatHooks({
    chatWindowOpen,
    setUnreadMessages,
    messageRefInput: messageRefInput as any
  })

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

  /** @todo */
  const audioState = useAudioState()
  // const [entity] = useState<Entity>(createEntity(Engine.instance.currentWorld))

  // useEffect(() => {
  //   if (entity) {
  //     const audioComponent = getComponent(entity, AudioComponent)
  //     audioComponent.volume = audioState.notificationVolume.value / 100
  //     updateAudio(entity)
  //   }
  // }, [audioState.notificationVolume])

  // const fetchAudioAlert = async () => {
  //   setIsInitRender(true)
  //   addComponent(entity, NameComponent, { name: 'Audio Alert Entity' })
  //   addComponent(entity, Object3DComponent, { value: new UpdateableObject3D() })
  //   addComponent(entity, PersistTagComponent, true)
  //   const audioComponent = addComponent(entity, AudioComponent, { ...SCENE_COMPONENT_AUDIO_DEFAULT_VALUES })
  //   audioComponent.volume = audioState.notificationVolume.value / 100
  //   audioComponent.audioSource = notificationAlertURL
  //   AssetLoader.loadAsync(notificationAlertURL)
  // }

  // useEffect(() => {
  //   if (getEngineState().sceneLoaded.value) fetchAudioAlert()
  //   matchActionOnce(EngineActions.sceneLoaded.matches, () => {
  //     fetchAudioAlert()
  //   })
  // }, [])

  const messageRef = useRef<any>()

  useEffect(() => {
    if (
      sortedMessages &&
      sortedMessages[sortedMessages.length - 1]?.senderId !== user?.id.value &&
      chatState.messageCreated.value
    ) {
      setUnreadMessages(true)
      el.play()
    }

    const messageRefCurrentRenderedInterval = setInterval(() => {
      if (messageRef.current && messageRef.current.scrollHeight > 0) {
        messageRef.current.scrollTop = messageRef.current.scrollHeight
        clearInterval(messageRefCurrentRenderedInterval)
      }
    }, 5)
  }, [chatState.messageCreated.value, sortedMessages])

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
      }, 5)
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
          if (isMobile) setShowTouchPad(true)
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
                          <p className={styles.greyText}>{message.text}</p>
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
              isInitRender ? animate : !chatWindowOpen ? (isMobile ? styles.animateTop : styles.animateLeft) : ''
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
              >
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
        </div>
      </div>
    </>
  )
}

export default InstanceChat
