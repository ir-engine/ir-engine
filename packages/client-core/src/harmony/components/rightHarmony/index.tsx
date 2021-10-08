import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import './main.css'
import { MessageBox } from 'react-chat-elements'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import Send from '@material-ui/icons/Send'
import { useStyle, useStyles } from './style'

export default function RightHarmony() {
  const classex = useStyle()
  const classes = useStyles()
  return (
    <div className={classes.rightRoot}>
      <div className={classes.title}>
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
        </ListItemAvatar>
        <ListItemText
          className={classes.listText}
          primary="Kimenyi kevin"
          secondary={<React.Fragment>{'Online'}</React.Fragment>}
        />
      </div>
      <div style={{ padding: '10px 0', overflowY: 'auto', height: '85vh' }}>
        {[
          'left',
          'right',
          'left',
          'right',
          'left',
          'right',
          'left',
          'left',
          'right',
          'left',
          'right',
          'left',
          'right'
        ].map((el) => (
          <MessageBox
            position={el}
            type={'text'}
            text={`
            Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud
            Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud
            Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud
            Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud Aliqua amet incididunt id nostrud`}
            data={{
              status: {
                click: false,
                loading: 0
              }
            }}
          />
        ))}
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
