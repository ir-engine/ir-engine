import React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { useUserStyles } from './style'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { useAuthState } from '../../../user/services/AuthService'
import { ChatService } from '../../../social/services/ChatService'
import { useDispatch } from '../../../store'

export default function UserListData({ data, chatType }) {
  const classes = useUserStyles()
  const selfUser = useAuthState().user
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (Object.keys(data).length !== 0) {
      dispatch(ChatService.updateChatTarget(chatType.toLowerCase(), data))
    }
  }, [chatType, data])

  console.log(data)

  return (
    <div>
      <List className={classes.root}>
        {Object.keys(data).length !== 0 &&
          data.map((el) => {
            return (
              <div key={el.id}>
                <ListItem alignItems="flex-start" className={classes.listBtn} button>
                  <ListItemAvatar>
                    <Avatar>{el.name.slice(0, 1).toLocaleUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    className={classes.listText}
                    primary={selfUser.value.id === el.id ? `${el.name} (you)` : el.name}
                    secondary={<React.Fragment>{el.description}</React.Fragment>}
                  />
                </ListItem>
                <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
              </div>
            )
          })}
      </List>
    </div>
  )
}
