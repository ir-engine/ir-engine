import React from 'react'
import Button from '@mui/material/Button'
import GroupAdd from '@mui/icons-material/GroupAdd'
import { useUserState } from '../../../user/services/UserService'
import { useAuthState } from '../../../user/services/AuthService'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import { useGroupState } from '../../../social/services/GroupService'
import { useFriendState } from '../../../social/services/FriendService'
import { usePartyState } from '../../../social/services/PartyService'
import { ChatService } from '../../../social/services/ChatService'
import { useDispatch } from '../../../store'
import InviteHarmony from '../inviteHarmony'
import CreateGroup from './CreateGroup'
import { useUserStyles } from './style'
import { useHistory } from 'react-router-dom'
import queryString from 'querystring'

const UserList = ({ chatType }) => {
  const [openInvite, setOpenInvite] = React.useState(false)
  const history = useHistory()
  const persed = queryString.parse(location.search)
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
  const [openCreateGroupModel, setOpenCreateGroupModel] = React.useState(false)
  const [channelData, setChannelData] = React.useState([])

  const toggleCreateGroupModel = (open: boolean) => {
    setOpenCreateGroupModel(open)
  }

  const openInviteModel = (open: boolean) => {
    setOpenInvite(open)
  }

  console.log(groups)
  React.useEffect(() => {
    let data
    switch (chatType) {
      case 'Group':
        data = groups
        if (Object.keys(groups).length !== 0) {
          history.push({
            pathname: '/harmony',
            search: `?channel=${persed['?channel']}&&channelId=${data[0].id}`
          })
        }
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
    data = data ? data : {}
    if (Object.keys(data).length !== 0) {
      dispatch(ChatService.updateChatTarget(chatType.toLowerCase(), data))
    }
    if (Object.keys(data).length !== 0) {
      setChannelData(data)
    }
  }, [chatType])

  return (
    <div>
      <List className={classes.root}>
        {channelData &&
          channelData.map((el) => {
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

      {chatType === 'Group' ? (
        <Button
          variant="contained"
          color="warning"
          style={{ marginTop: '3rem', marginLeft: '4rem' }}
          startIcon={<GroupAdd />}
          onClick={() => toggleCreateGroupModel(true)}
        >
          Create Group
        </Button>
      ) : (
        <Button
          variant="contained"
          color="warning"
          style={{ marginTop: '3rem', marginLeft: '4rem' }}
          startIcon={<GroupAdd />}
          onClick={() => openInviteModel(true)}
        >
          Invite
        </Button>
      )}

      <InviteHarmony open={openInvite} handleClose={openInviteModel} />
      <CreateGroup open={openCreateGroupModel} handleClose={toggleCreateGroupModel} />
    </div>
  )
}

export default UserList
