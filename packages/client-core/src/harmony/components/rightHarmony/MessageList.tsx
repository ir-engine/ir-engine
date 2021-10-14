import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import { useStyle, useStyles } from './style'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Person from '@material-ui/icons/Person'
import Face from '@material-ui/icons/Face'
import Typography from '@mui/material/Typography'
import { Message } from '@xrengine/common/src/interfaces/Message'
import moment from 'moment'

interface Props {
  activeChannel: any
  selfUser: any
}

export default function MessageList(props: Props) {
  const { activeChannel, selfUser } = props
  console.log(activeChannel)
  const classex = useStyle()
  const classes = useStyles()

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
                <ListItem button className={classes.listBtn} key={message.id}>
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
                  <ListItemText
                    primary={activeChannel?.instance?.instanceUsers[0].name}
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
                </ListItem>
              )
            })}
      </List>
    </div>
  )
}
