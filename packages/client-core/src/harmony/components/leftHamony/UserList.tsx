import React from 'react'
import Button from '@mui/material/Button'
import GroupAdd from '@mui/icons-material/GroupAdd'
import { useUserState } from '../../../user/services/UserService'
import { useAuthState } from '../../../user/services/AuthService'
import { useGroupState } from '../../../social/services/GroupService'
import { useFriendState } from '../../../social/services/FriendService'
import { usePartyState } from '../../../social/services/PartyService'
import InviteHarmony from '../inviteHarmony'
import CreateGroup from './CreateGroup'
import { useUserStyles } from './style'
import { useHistory } from 'react-router-dom'
import queryString from 'querystring'
import UserListData from './UserListData'

const UserList = ({ chatType }) => {
  const [openInvite, setOpenInvite] = React.useState(false)
  const history = useHistory()
  const persed = queryString.parse(location.search)
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

  const toggleCreateGroupModel = (open: boolean) => {
    setOpenCreateGroupModel(open)
  }

  const openInviteModel = (open: boolean) => {
    setOpenInvite(open)
  }

  return (
    <div>
      {chatType === 'Party' && <UserListData data={party} chatType={chatType} />}
      {chatType === 'Friends' && <UserListData data={friends} chatType={chatType} />}
      {chatType === 'Group' && <UserListData data={groups} chatType={chatType} />}
      {chatType === 'Layer' && <UserListData data={instanceLayerUsers} chatType={chatType} />}
      {
        // chatType === "Instance" && <UserListData data ={[{id: selfUser.instanceId.value}]}/>
      }

      {chatType === 'Group' ? (
        <Button
          variant="contained"
          color="warning"
          className={classes.createBtn}
          startIcon={<GroupAdd />}
          onClick={() => toggleCreateGroupModel(true)}
        >
          Create Group
        </Button>
      ) : (
        <Button
          variant="contained"
          color="warning"
          className={classes.createBtn}
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
