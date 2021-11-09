import React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import { useStyles } from './style'

interface Props {
  sentInvites: any
}

const SentInvites = (props: Props) => {
  const { sentInvites } = props
  const classes = useStyles()
  const capitalize = (word) => word[0].toUpperCase() + word.slice(1)

  return (
    <div className={classes.scroll}>
      {sentInvites.value.length ? (
        <List className={classes.rootList}>
          {[...sentInvites?.value]
            .sort((a, b) => {
              return a.createdAt - b.createdAt
            })
            .map((invite) => {
              return (
                <div key={invite.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={invite.user.avatarUrl} />
                    </ListItemAvatar>
                    {invite?.inviteType === 'friend' && (
                      <ListItemText style={{ backgroundColor: '#43484F', color: '#f1f1f1' }}>
                        {capitalize(invite?.inviteType)} request to{' '}
                        {invite.invitee ? invite.invitee.name : invite.token}
                      </ListItemText>
                    )}
                    {invite?.inviteType === 'group' && (
                      <ListItemText style={{ backgroundColor: '#43484F', color: '#f1f1f1' }}>
                        Join group {invite?.groupName} to {invite.invitee ? invite.invitee.name : invite.token}
                      </ListItemText>
                    )}
                    {invite?.inviteType === 'party' && (
                      <ListItemText style={{ backgroundColor: '#43484F', color: '#f1f1f1' }}>
                        Join a party to {invite.invitee ? invite.invitee.name : invite.token}
                      </ListItemText>
                    )}
                    {invite.accepted ? (
                      <Chip label="accepted" variant="outlined" className={classes.accepted} />
                    ) : (
                      <Chip label="pending" variant="outlined" className={classes.accepted} />
                    )}
                  </ListItem>

                  <Divider
                    variant="fullWidth"
                    component="li"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }}
                  />
                </div>
              )
            })}
        </List>
      ) : (
        ''
      )}
    </div>
  )
}

export default SentInvites
