import React from 'react'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { useStyle, useStyles, RootList, AcceptInviteBtn } from './style'

interface Props {
  receivedInvites?: any
}

const ReceivedInvites = (props: Props) => {
  const { receivedInvites } = props
  const classes = useStyles()
  const capitalize = (word) => word[0].toUpperCase() + word.slice(1)

  const acceptRequest = (invite) => {
    InviteService.acceptInvite(invite.id, invite.passcode)
  }

  const declineRequest = (invite) => {
    InviteService.declineInvite(invite)
  }
  return (
    <div className={classes.scroll}>
      {receivedInvites.value.length ? (
        <RootList>
          {[...receivedInvites?.value]
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((invite) => {
              return (
                <div key={invite.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={invite.user.avatarUrl} />
                    </ListItemAvatar>
                    {invite?.inviteType === 'friend' && (
                      <ListItemText style={{ backgroundColor: '#43484F', color: '#f1f1f1' }}>
                        {capitalize(invite?.inviteType || '')} request from {invite.user.name}
                      </ListItemText>
                    )}
                    {invite?.inviteType === 'group' && (
                      <ListItemText style={{ backgroundColor: '#43484F', color: '#f1f1f1' }}>
                        Join group {invite?.groupName} from {invite.user.name}
                      </ListItemText>
                    )}
                    {invite?.inviteType === 'party' && (
                      <ListItemText style={{ backgroundColor: '#43484F', color: '#f1f1f1' }}>
                        Join a party from {invite.user.name}
                      </ListItemText>
                    )}
                    <div className={classes.btnContainer}>
                      <AcceptInviteBtn variant="contained" onClick={() => acceptRequest(invite)}>
                        Accept
                      </AcceptInviteBtn>
                      <Button
                        variant="contained"
                        className={classes.rejectedBtn}
                        onClick={() => declineRequest(invite)}
                      >
                        Decline
                      </Button>
                    </div>
                  </ListItem>

                  <Divider
                    variant="fullWidth"
                    component="li"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }}
                  />
                </div>
              )
            })}
        </RootList>
      ) : (
        ''
      )}
    </div>
  )
}

export default ReceivedInvites
