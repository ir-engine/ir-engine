/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import CloseIcon from '@mui/icons-material/Close'
import MessageIcon from '@mui/icons-material/Message'
import Fab from '@mui/material/Fab'
import React, { Fragment, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ChannelState } from '@ir-engine/client-core/src/social/services/ChannelService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useFind, useMutation } from '@ir-engine/common'
import {
  InstanceID,
  MessageID,
  MessageType,
  UserName,
  UserType,
  messagePath
} from '@ir-engine/common/src/schema.type.module'
import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { dispatchAction, getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import Avatar from '@ir-engine/ui/src/primitives/mui/Avatar'
import Badge from '@ir-engine/ui/src/primitives/mui/Badge'
import Card from '@ir-engine/ui/src/primitives/mui/Card'
import CardContent from '@ir-engine/ui/src/primitives/mui/CardContent'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButton from '@ir-engine/ui/src/primitives/mui/IconButton'
import TextField from '@ir-engine/ui/src/primitives/mui/TextField'

import multiLogger from '@ir-engine/common/src/logger'
import { AppState } from '../../common/services/AppService'
import { AvatarUIActions, AvatarUIState } from '../../systems/state/AvatarUIState'
import { useUserAvatarThumbnail } from '../../user/functions/useUserAvatarThumbnail'
import { clientContextParams } from '../../util/ClientContextState'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import { default as defaultStyles, default as styles } from './index.module.scss'

const logger = multiLogger.child({ component: 'client-core:InstanceChat', modifier: clientContextParams })

interface ChatHooksProps {
  chatWindowOpen: boolean
  setUnreadMessages: React.Dispatch<React.SetStateAction<boolean>>
  messageRefInput: React.MutableRefObject<HTMLInputElement>
}

export const useChatHooks = ({ chatWindowOpen, setUnreadMessages, messageRefInput }: ChatHooksProps) => {
  /**
   * Message display logic
   */

  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId)

  /** @todo allow paginated scrolling to retrieve earlier messages */
  const messages = useFind(messagePath, {
    query: {
      channelId: targetChannelId.value,
      $limit: 20,
      $sort: { createdAt: -1 }
    }
  })
  const mutateMessage = useMutation(messagePath, false)

  useEffect(() => {
    if (messages.data?.length && !chatWindowOpen) setUnreadMessages(true)
  }, [messages.data, chatWindowOpen])

  /**
   * Message composition logic
   */

  const sortedMessagesState = useHookstate([] as MessageType[])
  const composingMessage = useHookstate('')
  const cursorPosition = useHookstate(0)
  const user = useHookstate(getMutableState(AuthState).user)
  const usersTyping = useHookstate(getMutableState(AvatarUIState)).usersTyping[user?.id.value].value
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
        AvatarUIActions.setUserTyping({
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
          AvatarUIActions.setUserTyping({
            typing: true
          })
        )
      }
    }
    if (message.length == 0 || message.length < composingMessage.value.length) {
      if (usersTyping) {
        dispatchAction(
          AvatarUIActions.setUserTyping({
            typing: false
          })
        )
      }
    }

    composingMessage.set(message)
  }

  const packageMessage = (): void => {
    const instanceId = NetworkState.worldNetwork.id as InstanceID
    if (composingMessage?.value?.length && instanceId) {
      if (usersTyping) {
        dispatchAction(
          AvatarUIActions.setUserTyping({
            typing: false
          })
        )
      }

      mutateMessage
        .create({
          text: composingMessage.value,
          channelId: targetChannelId.value
        })
        .then((message) => {
          // will get overwritten by the query effect below, but we need to update the UI immediately
          sortedMessagesState.merge([message])
        })

      composingMessage.set('')
    }

    cursorPosition.set(0)
  }

  useEffect(() => {
    sortedMessagesState.set([...messages.data].reverse())
  }, [messages.data])

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
    handleComposingMessageChange,
    packageMessage,
    composingMessage: composingMessage.value,
    sortedMessages: sortedMessagesState.value as MessageType[]
  }
}

interface InstanceChatProps {
  styles?: any
}

const Message = (props: { user: UserType; sortedMessages: MessageType[]; message: MessageType; index: number }) => {
  const { user, sortedMessages, message, index } = props

  const userThumbnail = useUserAvatarThumbnail(message.senderId)

  return (
    <>
      <Fragment key={message.id as MessageID}>
        {message.isNotification ? (
          <div key={message.id as MessageID} id={message.id} className={`${styles.selfEnd} ${styles.noMargin}`}>
            <div className={styles.dFlex}>
              <div className={`${styles.msgNotification} ${styles.mx2}`}>
                <p className={styles.shadowText}>{message.text}</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            key={message.id as MessageID}
            id={message.id}
            className={`${styles.dFlex} ${styles.flexColumn} ${styles.mgSmall}`}
          >
            <div className={`${styles.selfEnd} ${styles.noMargin}`}>
              <div
                className={`${message.senderId !== user?.id ? styles.msgReplyContainer : styles.msgOwner} ${
                  styles.msgContainer
                } ${styles.dFlex}`}
              >
                <div className={styles.msgWrapper}>
                  {sortedMessages[index - 1] && sortedMessages[index - 1].isNotification ? (
                    <h3 className={styles.sender}>{message.sender.name as UserName}</h3>
                  ) : (
                    sortedMessages[index - 1] &&
                    message.senderId !== sortedMessages[index - 1].senderId && (
                      <h3 className={styles.sender}>{message.sender.name as UserName}</h3>
                    )
                  )}
                  <p className={styles.text}>{message.text}</p>
                </div>
                {index !== 0 && sortedMessages[index - 1] && sortedMessages[index - 1].isNotification ? (
                  <Avatar src={userThumbnail} className={styles.avatar} />
                ) : (
                  sortedMessages[index - 1] &&
                  message.senderId !== sortedMessages[index - 1].senderId && (
                    <Avatar src={userThumbnail} className={styles.avatar} />
                  )
                )}
                {index === 0 && <Avatar src={userThumbnail} className={styles.avatar} />}
              </div>
            </div>
          </div>
        )}
      </Fragment>
    </>
  )
}

export const InstanceChat = ({ styles = defaultStyles }: InstanceChatProps) => {
  const { t } = useTranslation()
  const chatWindowOpen = useHookstate(false)
  const unreadMessages = useHookstate(false)
  const messageContainerVisible = useHookstate(false)
  const messageRefInput = useRef<HTMLInputElement>()

  const { handleComposingMessageChange, packageMessage, composingMessage, sortedMessages } = useChatHooks({
    chatWindowOpen: chatWindowOpen.value,
    setUnreadMessages: unreadMessages.set,
    messageRefInput: messageRefInput as any
  })

  const user = useHookstate(getMutableState(AuthState).user)

  const isInitRender = useHookstate<boolean>(false)

  const isMobile = /Mobi/i.test(window.navigator.userAgent)
  const chatState = useMutableState(ChannelState)

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

  // When messages change, scroll to most recent message if the previous most-recent message is at least partially visible
  useEffect(() => {
    const lastMessage = sortedMessages[sortedMessages.length - 1]
    if (!sortedMessages.length) return
    const lastMessageElement = document.getElementById(lastMessage.id)
    if (!lastMessageElement) return
    const rect = lastMessageElement.getBoundingClientRect()
    const elemTop = rect.top
    const elemBottom = rect.bottom
    const isVisible = elemTop < window.innerHeight && elemBottom >= 0
    if (isVisible) messageRef.current.scrollTop = messageRef.current.scrollHeight
  }, [sortedMessages])

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
    getMutableState(AppState).merge({
      showTopShelf: false,
      showBottomShelf: false,
      showTouchPad: false
    })
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
    logger.info({ event_name: 'world_chat_toggle', event_value: chatWindowOpen.value })
    chatWindowOpen.value && unreadMessages.set(false)
    isInitRender.set(false)
  }

  return (
    <>
      <div
        onClick={() => {
          chatWindowOpen.set(false)
          unreadMessages.set(false)
          getMutableState(AppState).showTouchPad.set(true)
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
            {sortedMessages?.map((message, index) => (
              <Message
                sortedMessages={sortedMessages}
                user={user.value as UserType}
                message={message}
                index={index}
                key={message.id as MessageID}
              />
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
                  label={'World Chat...'}
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
                title={t('user:menu.toggleChat')}
                className={styles.chatBadge}
                color="primary"
                onClick={() => toggleChatWindow()}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              >
                {chatWindowOpen.value ? (
                  <CloseIcon
                    onClick={() => {
                      getMutableState(AppState).showTouchPad.set(true)
                    }}
                  />
                ) : (
                  <MessageIcon />
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
  const { t } = useTranslation()
  const { bottomShelfStyle } = useShelfStyles()

  const acceptedTOS = useMutableState(AuthState).user.acceptedTOS.value
  const isGuest = useMutableState(AuthState).user.isGuest.value

  const networkWorldConfig = useHookstate(getMutableState(NetworkState).config.world)
  const targetChannelId = useHookstate(getMutableState(ChannelState).targetChannelId)

  if (isGuest)
    return (
      <>
        <div className={styles.modalConnecting}>
          <div className={styles.modalConnectingTitle}>
            <p>{t('common:loader.needToLogIn')}</p>
          </div>
        </div>
      </>
    )

  if (!acceptedTOS)
    return (
      <>
        <div className={styles.modalConnecting}>
          <div className={styles.modalConnectingTitle}>
            <p>{t('common:loader.needToAgreeTOS')}</p>
          </div>
        </div>
      </>
    )

  return (
    <>
      {targetChannelId.value ? (
        <div className={`${bottomShelfStyle} ${styles.chatRoot}`}>
          <InstanceChat />
        </div>
      ) : (
        <>
          {networkWorldConfig.value && (
            <div className={styles.modalConnecting}>
              <div className={styles.modalConnectingTitle}>
                <p>{t('common:loader.connectingToWorld')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
