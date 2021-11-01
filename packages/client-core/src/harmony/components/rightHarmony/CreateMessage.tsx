import React, { useState } from 'react'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Send from '@mui/icons-material/Send'
import { ChatService } from '../../../social/services/ChatService'
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
      <IconButton
        color="primary"
        className={classes.iconButton}
        aria-label="directions"
        onClick={packageMessage}
        size="large"
      >
        <Send />
      </IconButton>
    </Paper>
  )
}

export default CreateMessage
