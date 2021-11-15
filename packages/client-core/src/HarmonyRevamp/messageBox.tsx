import React, { useState } from 'react'
import { Avatar, IconButton, Container } from '@mui/material'
import { AttachFile, LocalPhone, PhotoCamera, Send } from '@material-ui/icons'
import { useHarmonyStyles } from './style'
import { styled } from '@mui/material/styles'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useChatState } from '@xrengine/client-core/src/social/services/ChatService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Message } from '@xrengine/common/src/interfaces/Message'

const Input = styled('input')({
  display: 'none'
})

const MessageBox: React.FunctionComponent = () => {
  const [composingMessage, setComposingMessage] = useState('')

  const chatState = useChatState()
  const selfUser = useAuthState().user.value
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelEntries = Object.values(channels).filter((channel) => !!channel)!
  const targetChannelId = chatState.targetChannelId.value
  // To be uncommented for real test
  const activeChannel = channels.find((c) => c.id === targetChannelId)!

  // Used for testing purpose
  // const activeChannel = channels[1]
  const composingMessageChangedHandler = (event: any): void => {
    const message = event.target.value
    setComposingMessage(message)
  }

  const classes = useHarmonyStyles()

  const packageMessage = (): void => {
    if (composingMessage.length > 0) {
      ChatService.createMessage({
        text: composingMessage
      })
      setComposingMessage('')
    }
  }

  React.useEffect(() => {
    if (channelState.updateNeeded.value === true) {
      ChatService.getChannels()
    }
  }, [channelState.updateNeeded.value])

  React.useEffect(() => {
    channelEntries.forEach((channel) => {
      if (channel?.updateNeeded != null && channel?.updateNeeded === true) {
        ChatService.getChannelMessages(channel.id)
      }
    })
  }, [channels])

  let sortedMessages
  if (activeChannel != null && activeChannel.messages) {
    sortedMessages = [...activeChannel.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }
  return (
    <>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.p2}`}>
        <h2>{selfUser?.name}</h2>
        <LocalPhone fontSize="small" />
      </div>
      <Container>
        <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h100}`}>
          <div className={classes.scroll}>
            {sortedMessages?.map((message: Message, index: number) => {
              return (
                <div key={message.id} className={`${classes.dFlex} ${classes.flexColumn} ${classes.my2}`}>
                  {message.senderId !== selfUser.id && (
                    <div className={`${classes.selfStart}`}>
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
                    <div className={classes.selfEnd}>
                      <div className={classes.dFlex}>
                        <div className={`${classes.bgInfo} ${classes.mx2}`}>
                          <p>{message.text}</p>
                        </div>
                        {index !== 0 && message.senderId !== sortedMessages[index - 1].senderId && (
                          <Avatar src={message.sender?.avatarUrl} />
                        )}
                        {index === 0 && <Avatar src={message.sender?.avatarUrl} />}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
            <label htmlFor="icon-button-file">
              <Input accept="image/*" id="icon-button-file" type="file" />
              <IconButton aria-label="upload picture" component="span">
                <AttachFile className={classes.white} />
              </IconButton>
            </label>
            <div className={classes.flexGrow}>
              <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                <Avatar src={selfUser.avatarUrl} />
                <textarea
                  className={`${classes.formControl} ${classes.inPad}`}
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
            </div>
            <IconButton onClick={packageMessage} component="span">
              <Send className={classes.white} />
            </IconButton>
          </div>
        </div>
      </Container>
    </>
  )
}

export default MessageBox
