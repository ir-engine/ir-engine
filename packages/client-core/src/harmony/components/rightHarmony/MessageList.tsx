import React, { useState } from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import { useStyle, useStyles, StyledMenu } from './style'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Person from '@material-ui/icons/Person'
import Face from '@material-ui/icons/Face'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import EditIcon from '@mui/icons-material/Edit'
import { useDispatch } from '@xrengine/client-core/src/store'
import { ChatService } from '../../../social/state/ChatService'
import StarIcon from '@mui/icons-material/Star'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplyIcon from '@mui/icons-material/Reply'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Message } from '@xrengine/common/src/interfaces/Message'
import moment from 'moment'

interface Props {
  activeChannel: any
  selfUser: any
  targetChannelId: any
  targetObject: any
  targetObjectType: any
}

export default function MessageList(props: Props) {
  const { activeChannel, selfUser, targetChannelId, targetObjectType, targetObject } = props
  const dispatch = useDispatch()
  const classex = useStyle()
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [messageUpdatePending, setMessageUpdatePending] = useState('')
  const [editingMessage, setEditingMessage] = useState({})
  const [editingMessageText, setEditingMessageText] = useState('')
  const [messageTodelete, setMessageToDelete] = useState('')
  const [showWarning, setShowWarning] = React.useState(false)

  const handleClick = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    setAnchorEl(event.currentTarget)
    setMessageToDelete(message.id)
    setEditingMessage({ ...message })
  }

  const handleClose = () => {
    setAnchorEl(null)
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

  const handleEditingMessageChange = (event: any): void => {
    const message = event.target.value
    setEditingMessageText(message)
  }

  const loadMessageEdit = (e: any, message: Message) => {
    e.preventDefault()
    setAnchorEl(null)
    setMessageUpdatePending(editingMessage.id)
    setEditingMessageText(editingMessage.text)
    setMessageToDelete('')
  }

  const confirmMessageUpdate = (e: any) => {
    e.preventDefault()
    ChatService.patchMessage(messageUpdatePending, editingMessageText)
    setMessageUpdatePending('')
    setEditingMessage('')
  }

  const generateMessageSecondary = (message: Message): string => {
    const date = moment(message.createdAt).format('MMM D YYYY, h:mm a')
    if (message.senderId !== selfUser.id.value) {
      return `${message?.sender?.name ? message.sender.name : 'A former user'} on ${date}`
    } else {
      return date
    }
  }

  return (
    <div className={classes.messageContainer}>
      <List style={{ backgroundColor: '#1f252d' }}>
        {activeChannel.messages &&
          [...activeChannel.messages]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((message) => {
              return (
                <div key={message.id}>
                  <ListItem
                    key={message.id}
                    button
                    className={classes.listBtn}
                    onClick={(event) => handleClick(event, message)}
                  >
                    {message.senderId !== selfUser.id.value ? (
                      <ListItemAvatar>
                        {message.sender?.avatarUrl ? (
                          <Avatar src={message.sender?.avatarUrl} />
                        ) : (
                          <Avatar>
                            <Face />
                          </Avatar>
                        )}
                      </ListItemAvatar>
                    ) : (
                      <ListItemAvatar>
                        {message.sender?.avatarUrl ? (
                          <Avatar src={message.sender?.avatarUrl} />
                        ) : (
                          <Avatar>
                            <Person />
                          </Avatar>
                        )}
                      </ListItemAvatar>
                    )}
                    {messageUpdatePending !== message.id && (
                      <ListItemText
                        primary={message?.sender?.name}
                        secondary={
                          <React.Fragment>
                            {message.text}
                            <Typography
                              sx={{ display: 'inline', marginLeft: '20px', fontSize: '9px' }}
                              component="span"
                              variant="body2"
                              color="#c2c2c2"
                            >
                              {generateMessageSecondary(message)}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    )}
                  </ListItem>
                  {messageUpdatePending === message.id && (
                    <TextField
                      className={classes.inputEdit}
                      InputProps={{
                        classes: { notchedOutline: classes.noBorder }
                      }}
                      id="editingMessageText"
                      placeholder="Abc"
                      autoFocus
                      variant="outlined"
                      multiline
                      name="editingMessageText"
                      value={editingMessageText}
                      inputProps={{ 'aria-label': 'search google maps' }}
                      onChange={handleEditingMessageChange}
                      onKeyPress={(e) => {
                        if (e.charCode === 13 && e.shiftKey) {
                        } else if (e.charCode === 13) {
                          e.preventDefault()
                          confirmMessageUpdate(e)
                        }
                      }}
                    />
                  )}
                  {message.senderId === selfUser.id.value ? (
                    <div>
                      <StyledMenu
                        id="demo-customized-menu"
                        MenuListProps={{
                          'aria-labelledby': 'demo-customized-button'
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={(e) => loadMessageEdit(e, message)} disableRipple>
                          <EditIcon />
                          Edit Message
                        </MenuItem>
                        <MenuItem onClick={handleClose} disableRipple>
                          <ReplyIcon />
                          Reply
                        </MenuItem>
                        <MenuItem onClick={handleClose} disableRipple>
                          <StarIcon />
                          Star
                        </MenuItem>
                        <MenuItem onClick={showMessageDeleteConfirm} style={{ color: '#ff2626' }} disableRipple>
                          <DeleteIcon style={{ color: '#ff2626' }} />
                          Delete Message
                        </MenuItem>
                      </StyledMenu>
                    </div>
                  ) : (
                    <div>
                      <StyledMenu
                        id="demo-customized-menu"
                        MenuListProps={{
                          'aria-labelledby': 'demo-customized-button'
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={handleClose} disableRipple>
                          <ReplyIcon />
                          Reply
                        </MenuItem>
                        <MenuItem onClick={handleClose} disableRipple>
                          <StarIcon />
                          Star
                        </MenuItem>
                      </StyledMenu>
                    </div>
                  )}
                </div>
              )
            })}
      </List>
      <Dialog
        open={showWarning}
        onClose={cancelMessageDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle style={{ display: 'inline-block' }} id="alert-dialog-title">
          Confirm that you want to delete this Message
        </DialogTitle>
        <DialogActions>
          <Button variant="outlined" onClick={cancelMessageDelete}>
            Cancel
          </Button>
          <Button className={classes.saveBtn} onClick={(e) => confirmMessageDelete(e)} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
