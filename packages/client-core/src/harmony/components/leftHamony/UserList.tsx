import React from 'react'
import Button from '@mui/material/Button'
import GroupAdd from '@mui/icons-material/GroupAdd'
import { useUserState } from '../../../user/state/UserService'
import { useAuthState } from '../../../user/state/AuthService'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import { useGroupState } from '../../../social/state/GroupService'
import { useFriendState } from '../../../social/state/FriendService'
import { usePartyState } from '../../../social/state/PartyService'
import { ChatService } from '../../../social/state/ChatService'
import { useDispatch } from '../../../store'
import { useUserStyles } from './style'

const UserList = ({ chatType }) => {
  const dispatch = useDispatch()
  const classes = useUserStyles()
  const userState = useUserState()
  const groupState = useGroupState()
  const selfUser = useAuthState().user
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value
  const party = usePartyState().party.value
  const instanceLayerUsers = userState.layerUsers.value
  let data
  switch (chatType) {
    case 'Group':
      data = groups
      break
    case 'Freinds':
      data = friends
      break
    case 'Party':
      data = party
      break
    case 'Layer':
      data = instanceLayerUsers
      break
    case 'Instance':
      data = { id: selfUser.instanceId.value }
      break
    default:
      data = []
      break
  }
  if (data) {
    dispatch(ChatService.updateChatTarget(chatType.toLowerCase(), data))
  }

  return (
    <div>
      <List className={classes.root}>
        {data && data.length > 0 ? (
          data.map((el) => {
            return (
              <div key={el.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{el.name.slice(0, 1).toLocaleUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    style={{ backgroundColor: '#43484F' }}
                    primary={selfUser.value.id === el.id ? `${el.name} (you)` : el.name}
                    secondary={<React.Fragment>{el.description}</React.Fragment>}
                  />
                </ListItem>

                <Divider variant="fullWidth" component="li" style={{ backgroundColor: '#15171B' }} />
              </div>
            )
          })
        ) : (
          <Button
            variant="contained"
            color="secondary"
            style={{ marginTop: '4rem', marginLeft: '4rem' }}
            startIcon={<GroupAdd />}
          >
            Invite
          </Button>
        )}
      </List>
    </div>
  )
}

export default UserList
