import React, { useState, useContext } from 'react'
import { Delete, Edit } from '@mui/icons-material'
import {
  IconButton,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Avatar,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Button
} from '@mui/material'

import { AttachFile, LocalPhone, Send } from '@mui/icons-material'
import { useHarmonyStyles } from '../style'
import { styled } from '@mui/material/styles'
import { store } from '@xrengine/client-core/src/store'
import { ChatAction } from '@xrengine/client-core/src/social/services/ChatService'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Message } from '@xrengine/common/src/interfaces/Message'
import ModeContext from '../context/modeContext'

const Input = styled('input')({
  display: 'none'
})

const MessageBox: React.FunctionComponent = () => {
  const [composingMessage, setComposingMessage] = useState('')
  const { darkMode } = useContext(ModeContext)

  const dispatch = store.dispatch
  const chatState = useChatState()
  const selfUser = useAuthState().user.value
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const messageRef = React.useRef()
  const messageEl = messageRef.current
  const channelEntries = Object.values(channels).filter((channel) => !!channel)!
  const targetChannelId = chatState.targetChannelId.value
  const [anchorEl, setAnchorEl] = React.useState(null)
  const activeChannel = channels.find((c) => c.id === targetChannelId)!
  const channelRef = React.useRef(channels)
  const messageScrollInit = chatState.messageScrollInit
  const chatStateRef = React.useRef(chatState)

  const [messageUpdatePending, setMessageUpdatePending] = useState('')
  const [editingMessage, setEditingMessage] = useState({})
  const [editingMessageText, setEditingMessageText] = useState('')
  const [messageTodelete, setMessageToDelete] = useState('')
  const [showWarning, setShowWarning] = React.useState(false)

  const [messageScrollUpdate, setMessageScrollUpdate] = useState(false)
  const [topMessage, setTopMessage] = useState({})

  React.useEffect(() => {
    channelRef.current = channels
    channelEntries.forEach((channel) => {
      if (chatState.updateMessageScroll.value === true) {
        dispatch(ChatAction.setUpdateMessageScroll(false))
        if (
          channel?.id === targetChannelId &&
          messageEl != null &&
          (messageEl as any).scrollHeight -
            (messageEl as any).scrollTop -
            (messageEl as any).firstElementChild?.offsetHeight <=
            (messageEl as any).clientHeight + 20
        ) {
          ;(messageEl as any).scrollTop = (messageEl as any).scrollHeight
        }
      }
      if (channel?.updateNeeded != null && channel?.updateNeeded === true) {
        ChatService.getChannelMessages(channel.id)
      }
    })
  }, [channels])

  React.useEffect(() => {
    chatStateRef.current = chatState
    if (messageScrollInit.value === true && messageEl != null && (messageEl as any).scrollTop != null) {
      ;(messageEl as any).scrollTop = (messageEl as any).scrollHeight
      ChatService.updateMessageScrollInit(false)
      setMessageScrollUpdate(false)
    }
    if (messageScrollUpdate === true) {
      setMessageScrollUpdate(false)
      if (messageEl != null && (messageEl as any).scrollTop != null) {
        ;(messageEl as any).scrollTop = (topMessage as any).offsetTop
      }
    }
  }, [chatState])

  const nextMessagePage = (): void => {
    if (activeChannel.skip + activeChannel.limit < activeChannel.total) {
      ChatService.getChannelMessages(targetChannelId, activeChannel.skip + activeChannel.limit)
    } else {
      setMessageScrollUpdate(false)
    }
  }

  const onMessageScroll = (e): void => {
    if (
      e.target.scrollTop === 0 &&
      e.target.scrollHeight > e.target.clientHeight &&
      messageScrollInit.value !== true &&
      activeChannel.skip + activeChannel.limit < activeChannel.total
    ) {
      setMessageScrollUpdate(true)
      setTopMessage((messageEl as any).firstElementChild)
      nextMessagePage()
    }
  }

  const composingMessageChangedHandler = (event: any): void => {
    const message = event.target.value
    setComposingMessage(message)
  }

  const handleClick = (event, message: Message) => {
    setAnchorEl(event.currentTarget)
    setMessageToDelete(message.id)
    setEditingMessage({ ...message })
  }

  const showMessageDeleteConfirm = () => {
    setAnchorEl(null)
    setShowWarning(true)
    setMessageUpdatePending('')
    setEditingMessage('')
  }

  const cancelMessageDelete = (e: any) => {
    e.preventDefault()
    setShowWarning(false)
    setMessageToDelete('')
    setMessageUpdatePending('')
    setEditingMessage('')
  }

  const confirmMessageDelete = (e: any) => {
    e.preventDefault()
    setShowWarning(false)
    ChatService.removeMessage(messageTodelete)
    setMessageToDelete('')
  }

  const confirmMessageUpdate = (e: any) => {
    e.preventDefault()
    ChatService.patchMessage(messageUpdatePending, editingMessageText)
    setMessageUpdatePending('')
    setEditingMessage('')
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const classes = useHarmonyStyles()

  const packageMessage = (): void => {
    if (composingMessage.length > 0) {
      ChatService.createMessage({
        text: composingMessage
      })
      setComposingMessage('')
    }
  }

  const handleEditingMessageChange = (event: any): void => {
    const message = event.target.value
    setEditingMessageText(message)
  }

  const loadMessageEdit = (e: any) => {
    e.preventDefault()
    setAnchorEl(null)
    setMessageUpdatePending(editingMessage.id)
    setEditingMessageText(editingMessage.text)
    setMessageToDelete('')
  }

  React.useEffect(() => {
    if (channelState.updateNeeded.value === true) {
      ChatService.getChannels()
    }
  }, [channelState.updateNeeded.value])

  let sortedMessages
  if (activeChannel != null && activeChannel.messages) {
    sortedMessages = [...activeChannel.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }
  return (
    <>
      <div
        className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.p2} ${
          !darkMode ? classes.bgLight : classes.bgDarkLight1
        }`}
      >
        <h2 className={darkMode ? classes.white : classes.textBlack}>{selfUser?.name}</h2>
        <LocalPhone fontSize="small" className={darkMode ? classes.white : classes.textBlack} />
      </div>
      <Container>
        <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h100}`}>
          <div ref={messageRef as any} className={classes.scroll} onScroll={(e) => onMessageScroll(e)}>
            {sortedMessages?.map((message: Message, index: number) => {
              return (
                <div key={message.id} className={`${classes.dFlex} ${classes.flexColumn} ${classes.my2}`}>
                  {message.senderId !== selfUser.id && (
                    <div className={`${classes.selfStart} ${classes.my1}`}>
                      <div className={classes.dFlex}>
                        {index !== 0 && message.senderId !== sortedMessages[index - 1].senderId && (
                          <Avatar src={message.sender?.avatarUrl} />
                        )}
                        {index === 0 && <Avatar src={message.sender?.avatarUrl} />}
                        <div className={`${classes.bgBlack} ${classes.mx2}`}>
                          <p>{message.text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {message.senderId === selfUser.id && (
                    <div className={`${classes.selfEnd} ${classes.my1}`}>
                      <div className={classes.dFlex}>
                        {messageUpdatePending === message.id ? (
                          <div
                            className={`${classes.dFlex} ${classes.alignCenter} ${classes.textArea} ${
                              darkMode ? classes.darkBg : classes.bgLight
                            } `}
                          >
                            <Avatar src={selfUser.avatarUrl} />
                            <textarea
                              autoFocus
                              className={`${classes.formControl} ${classes.inPad} ${
                                darkMode ? classes.white : classes.textBlack
                              } ${classes.scroll}`}
                              value={editingMessageText}
                              onKeyPress={(e) => {
                                if (e.charCode === 13 && e.shiftKey) {
                                } else if (e.charCode === 13) {
                                  e.preventDefault()
                                  confirmMessageUpdate(e)
                                }
                              }}
                              onChange={handleEditingMessageChange}
                            ></textarea>
                          </div>
                        ) : (
                          <div
                            className={`${classes.bgInfo} ${classes.mx2} ${classes.btnCursor}`}
                            onClick={(e) => handleClick(e, message)}
                          >
                            <p>{message.text}</p>
                          </div>
                        )}
                        {index !== 0 && message.senderId !== sortedMessages[index - 1].senderId && (
                          <Avatar src={message.sender?.avatarUrl} />
                        )}
                        {index === 0 && <Avatar src={message.sender?.avatarUrl} />}
                      </div>
                    </div>
                  )}
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'center',
                      horizontal: 'left'
                    }}
                  >
                    <div className={classes.bgDarkLight}>
                      <MenuList sx={{ width: 210, maxWidth: '100%', borderRadius: 10 }}>
                        <MenuItem className={classes.my2} onClick={(e) => loadMessageEdit(e)}>
                          <ListItemIcon>
                            <Edit fontSize="small" className={classes.muted} />
                          </ListItemIcon>
                          <ListItemText classes={{ root: classes.fontSizeSmall }}>EDIT</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={showMessageDeleteConfirm} className={classes.my2}>
                          <ListItemIcon>
                            <Delete fontSize="small" className={classes.danger} />
                          </ListItemIcon>
                          <ListItemText>DELETE</ListItemText>
                        </MenuItem>
                      </MenuList>
                    </div>
                  </Popover>
                </div>
              )
            })}
          </div>

          <div
            className={`${classes.dFlex} ${classes.borderRadius} ${classes.justifyContentBetween} ${
              darkMode ? classes.darkBg : classes.bgLight
            }`}
          >
            <div
              className={`${classes.dFlex} ${classes.flexGrow} ${classes.alignCenter} ${classes.borderRadius} ${classes.bgColorTrans}`}
            >
              <Avatar src={selfUser.avatarUrl} />
              <textarea
                className={`${classes.formControl} ${classes.inPad} ${darkMode ? classes.white : classes.textBlack}`}
                placeholder="Your message"
                value={composingMessage}
                onKeyPress={(e) => {
                  if (e.shiftKey === false && e.charCode === 13) {
                    e.preventDefault()
                    packageMessage()
                  }
                }}
                onChange={composingMessageChangedHandler}
              ></textarea>
            </div>
            <div className={`${classes.dFlex} ${classes.alignCenter}`}>
              <label htmlFor="icon-button-file">
                <Input accept="image/*" id="icon-button-file" type="file" />
                <IconButton aria-label="upload picture" component="span">
                  <AttachFile className={darkMode ? classes.white : classes.textBlack} />
                </IconButton>
              </label>
              <label>
                <IconButton onClick={packageMessage} component="span">
                  <Send className={darkMode && classes.white} />
                </IconButton>
              </label>
            </div>
          </div>
          <Dialog
            open={showWarning}
            onClose={() => setShowWarning(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            classes={{ paper: classes.paperDialog }}
          >
            <DialogTitle id="alert-dialog-title">Confirm to delete this message!</DialogTitle>
            <DialogActions>
              <Button onClick={cancelMessageDelete} className={classes.spanNone}>
                Cancel
              </Button>
              <Button className={classes.spanDange} onClick={confirmMessageDelete} autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </Container>
    </>
  )
}

export default MessageBox
