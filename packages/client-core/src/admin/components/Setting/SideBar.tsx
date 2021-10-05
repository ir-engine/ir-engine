import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import ViewCompactIcon from '@material-ui/icons/ViewCompact'
import SportsEsportsIcon from '@material-ui/icons/SportsEsports'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import LockIcon from '@material-ui/icons/Lock'
import { Icon } from '@iconify/react'
import { useStyles } from './styles'

const settings = ({
  handleAuth,
  handleAws,
  handleChargebee,
  handleRedis,
  handleEmail,
  handleClient,
  handleGameServer,
  handleServer,
  handleAnalytics,
  serverFocused,
  awsFocused,
  emailFocused,
  gameFocused,
  clientFocused,
  authFocused,
  chargebeeFocused,
  redisFocused,
  analyticsFocused
}) => {
  const classes = useStyles()

  return (
    <div>
      <List>
        <Divider variant="inset" component="li" />
        <ListItem
          button
          onClick={handleAnalytics}
          className={analyticsFocused ? `${classes.autoFocused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d', color: 'orange' }}>
              <Icon icon="carbon:analytics" color="orange" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem
          button
          onClick={handleServer}
          className={serverFocused ? `${classes.focused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d', color: 'orange' }}>
              <Icon icon="carbon:bare-metal-server" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Server" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem
          button
          onClick={handleClient}
          className={clientFocused ? `${classes.focused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d', color: 'orange' }}>
              <ViewCompactIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Client" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem
          button
          onClick={handleGameServer}
          className={gameFocused ? `${classes.focused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d', color: 'orange' }}>
              <SportsEsportsIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Game Server" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem
          button
          onClick={handleEmail}
          className={emailFocused ? `${classes.focused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d', color: 'orange' }}>
              <MailOutlineIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Email" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem button onClick={handleAuth} className={authFocused ? `${classes.focused}` : `${classes.notFocused}`}>
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d', color: 'orange' }}>
              <LockIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Authentication" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem button onClick={handleAws} className={awsFocused ? `${classes.focused}` : `${classes.notFocused}`}>
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d' }}>
              <Icon icon="logos:aws" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Aws" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem
          button
          onClick={handleChargebee}
          className={chargebeeFocused ? `${classes.focused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d' }}>
              <Icon icon="logos:chargebee-icon" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Chargebee" />
        </ListItem>
        <Divider variant="inset" component="li" />
        <ListItem
          button
          onClick={handleRedis}
          className={redisFocused ? `${classes.focused}` : `${classes.notFocused}`}
        >
          <ListItemAvatar>
            <Avatar style={{ background: '#1f252d' }}>
              <Icon icon="logos:redis" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Redis" />
        </ListItem>
        <Divider variant="inset" component="li" />
      </List>
    </div>
  )
}

export default settings
