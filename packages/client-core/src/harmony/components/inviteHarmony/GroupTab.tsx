import React, { useState } from 'react'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import { useStyle, useStyles } from './style'

const GroupTab = () => {
  const classes = useStyles()
  const classex = useStyle()

  return (
    <Container style={{ marginTop: '4rem' }}>
      <Paper component="div" className={classes.input}>
        <InputBase name="name" placeholder="Enter group name" style={{ color: '#fff' }} autoComplete="off" />
      </Paper>
      <DialogActions className={classes.mb10}>
        <Button variant="contained" className={classes.createBtn}>
          Send Invite
        </Button>
      </DialogActions>
    </Container>
  )
}

export default GroupTab
