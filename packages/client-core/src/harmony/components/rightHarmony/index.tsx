import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Send from '@material-ui/icons/Send'
import Call from '@material-ui/icons/Call'
import MoreHoriz from '@material-ui/icons/MoreHoriz'
import { useStyle, useStyles } from './style'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Person from '@material-ui/icons/Person'
import Face from '@material-ui/icons/Face'

export default function RightHarmony() {
  const classex = useStyle()
  const classes = useStyles()
  return (
    <div className={classes.rightRoot}>
      <div className={classes.title}>
        <ListItemAvatar>
          <Person />
        </ListItemAvatar>
        <ListItemText
          className={classes.listText}
          primary="Kimenyi kevin"
          secondary={<React.Fragment>{'online'}</React.Fragment>}
        />
        <div style={{ marginRight: '1.5rem' }}>
          <IconButton>
            <Call className={classes.whiteIcon} />
          </IconButton>
          <IconButton>
            <MoreHoriz className={classes.whiteIcon} />
          </IconButton>
        </div>
      </div>
      <div className={classes.messageContainer}>
        <List style={{ backgroundColor: '#1f252d' }}>
          {[
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />,
            <Person />,
            <Face />
          ].map((el, i) => {
            return (
              <ListItem button className={classes.listBtn}>
                <ListItemAvatar>
                  <Avatar>{el}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={i % 2 === 0 ? 'Kimenyi' : 'Sam'}
                  secondary={i % 2 === 0 ? 'How are thing going on your side Sam' : 'Going great'}
                />
              </ListItem>
            )
          })}
        </List>
      </div>
      <div style={{ position: 'fixed', bottom: '0' }}>
        <Paper component="form" className={classes.root}>
          <InputBase
            className={classes.input}
            placeholder="Type.........."
            inputProps={{ 'aria-label': 'search google maps' }}
          />
          <IconButton color="primary" className={classes.iconButton} aria-label="directions">
            <Send />
          </IconButton>
        </Paper>
      </div>
    </div>
  )
}
