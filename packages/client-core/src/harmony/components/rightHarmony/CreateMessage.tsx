import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Send from '@material-ui/icons/Send'
import { ChatService } from '../../../social/state/ChatService'
import { useDispatch } from '../../../store'
import { useStyles } from './style'

const CreateMessage = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [composingMessage, setComposingMessage] = useState('')

  const handleComposingMessageChange = (event: any): void => {
    const message = event.target.value
    setComposingMessage(message)
  }

  const packageMessage = (): void => {
    if (composingMessage.length > 0) {
      dispatch(
        ChatService.createMessage({
          text: composingMessage
        })
      )
      setComposingMessage('')
    }
  }

  return (
    <Paper component="form" className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Type.........."
        name="newMessage"
        id="newMessage"
        value={composingMessage}
        inputProps={{ 'aria-label': 'search google maps' }}
        onKeyPress={(e) => {
          if (e.shiftKey === false && e.charCode === 13) {
            e.preventDefault()
            packageMessage()
          }
        }}
        onChange={handleComposingMessageChange}
      />
      <IconButton color="primary" className={classes.iconButton} aria-label="directions" onClick={packageMessage}>
        <Send />
      </IconButton>
    </Paper>
  )
}

export default CreateMessage
