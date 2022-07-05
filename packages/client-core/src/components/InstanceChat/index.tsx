import { Downgraded } from '@speigg/hookstate'
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
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { toggleAudio } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'
import { updateAudio } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { createNewEditorNode } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { addActionReceptor, dispatchAction, removeActionReceptor } from '@xrengine/hyperflux'

import { Cancel as CancelIcon, Message as MessageIcon, Send } from '@mui/icons-material'
import { IconButton, InputAdornment } from '@mui/material'
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
  const sortedMessages = activeChannel.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

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
        }),
        Engine.instance.currentWorld.worldNetwork.hostId
      )
    }, 3000)

    return () => clearTimeout(delayDebounce)
  }, [composingMessage])

  const handleComposingMessageChange = (event: any): void => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      const selectionStart = (event.target as HTMLInputElement).selectionStart

      setComposingMessage(
        composingMessage.substring(0, selectionStart || 0) + '\n' + composingMessage.substring(selectionStart || 0)
      )
      return
    } else if (event.key === 'Enter' && !event.ctrlKey) {
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
          }),
          Engine.instance.currentWorld.worldNetwork.hostId
        )
      }
    }
    if (message.length == 0 || message.length < composingMessage.length) {
      if (usersTyping) {
        dispatchAction(
          WorldNetworkAction.setUserTyping({
            typing: false
          }),
          Engine.instance.currentWorld.worldNetwork.hostId
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
          }),
          Engine.instance.currentWorld.worldNetwork.hostId
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
  CloseButton = CancelIcon,
  newMessageLabel = 'World Chat...',
  animate,
  hideOtherMenus,
  setShowTouchPad
}: InstanceChatProps): any => {
  const [chatWindowOpen, setChatWindowOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(false)
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

  const audioState = useAudioState()
  const [entity, setEntity] = useState<Entity>()

  useEffect(() => {
    if (entity) {
      const audioComponent = getComponent(entity, AudioComponent)
      audioComponent.volume = audioState.audio.value / 100
      updateAudio(entity, { volume: audioState.audio.value / 100 })
    }
  }, [audioState.audio.value])

  const fetchAudioAlert = async () => {
    setIsInitRender(true)
    AssetLoader.Cache.delete(notificationAlertURL)
    const loadPromise = AssetLoader.loadAsync(notificationAlertURL)
    const node = createEntityNode(createEntity(Engine.instance.currentWorld))
    setEntity(node.entity)
    createNewEditorNode(node, ScenePrefabs.audio)
    addEntityNodeInTree(node, Engine.instance.currentWorld.entityTree.rootNode)
    const audioComponent = getComponent(node.entity, AudioComponent)
    audioComponent.volume = audioState.audio.value / 100
    audioComponent.audioSource = notificationAlertURL

    await loadPromise
    updateAudio(node.entity, { volume: audioState.audio.value / 100, audioSource: notificationAlertURL })
  }

  useEffect(() => {
    if (getEngineState().sceneLoaded.value) fetchAudioAlert()
    matchActionOnce(EngineActions.sceneLoaded.matches, () => {
      fetchAudioAlert()
    })
  }, [])

  useEffect(() => {
    if (
      sortedMessages &&
      sortedMessages[sortedMessages.length - 1]?.senderId !== user?.id.value &&
      chatState.messageCreated.value
    ) {
      setUnreadMessages(true)
      entity && toggleAudio(entity)
    }
  }, [chatState])

  /**
   * Message scroll
   */

  const messageRef = useRef<any>()
  const messageEl = messageRef.current

  useEffect(() => {
    if (messageEl) messageEl.scrollTop = messageEl?.scrollHeight
  }, [chatState])

  const toggleChatWindow = () => {
    if (!chatWindowOpen && isMobile) hideOtherMenus()
    setChatWindowOpen(!chatWindowOpen)
    chatWindowOpen && setUnreadMessages(false)
    setIsInitRender(false)
  }

  const isLeftOrJoinText = (text: string) => {
    return / left the layer|joined the layer/.test(text)
  }

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
          <div ref={messageRef} className={styles['instance-chat-msg-container']}>
            <div className={styles['list-container']}>
              <Card square={true} elevation={0} className={styles['message-wrapper']}>
                <CardContent className={styles['message-container']}>
                  {sortedMessages &&
                    sortedMessages.map((message, index, messages) => (
                      <Fragment key={message.id}>
                        {!isLeftOrJoinText(message.text) ? (
                          <div key={message.id} className={`${styles.dFlex} ${styles.flexColumn} ${styles.mgSmall}`}>
                            <div className={`${styles.selfEnd} ${styles.noMargin}`}>
                              <div className={styles.dFlex}>
                                <div className={styles.msgWrapper}>
                                  {messages[index - 1] && isLeftOrJoinText(messages[index - 1].text) ? (
                                    <h3 className={styles.sender}>{message.sender.name}</h3>
                                  ) : (
                                    messages[index - 1] &&
                                    message.senderId !== messages[index - 1].senderId && (
                                      <h3 className={styles.sender}>{message.sender.name}</h3>
                                    )
                                  )}
                                  <div
                                    className={`${
                                      message.senderId !== user?.id.value ? styles.msgReplyContainer : styles.msgOwner
                                    } ${styles.msgContainer} ${styles.mx2}`}
                                  >
                                    <p className={styles.text}>{message.text}</p>
                                  </div>
                                </div>
                                {index !== 0 && messages[index - 1] && isLeftOrJoinText(messages[index - 1].text) ? (
                                  <Avatar src={getAvatarURLForUser(message.senderId)} className={styles.avatar} />
                                ) : (
                                  messages[index - 1] &&
                                  message.senderId !== messages[index - 1].senderId && (
                                    <Avatar src={getAvatarURLForUser(message.senderId)} className={styles.avatar} />
                                  )
                                )}
                                {index === 0 && (
                                  <Avatar src={getAvatarURLForUser(message.senderId)} className={styles.avatar} />
                                )}
                              </div>
                            </div>
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
                      </Fragment>
                    ))}
                </CardContent>
              </Card>
            </div>
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
            } ${!chatWindowOpen ? '' : styles.iconCallPos}`}
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
