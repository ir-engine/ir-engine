import React, { useState } from 'react'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import Container from '@mui/material/Container'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import { useStyle, useUserStyles } from './style'
import { validateUserForm } from '../../../admin/components/Users/validation'
import { GroupService } from '@xrengine/client-core/src/social/state/GroupService'

const GreateGroup = ({ open, handleClose }) => {
  const classex = useStyle()
  const classes = useUserStyles()
  const [state, setState] = useState({
    name: '',
    description: '',
    formErrors: {
      name: '',
      description: ''
    }
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    let temp = state.formErrors

    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required' : ''
        break
      case 'description':
        temp.description = value.length < 2 ? 'Description is required' : ''
        break
      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = (event) => {
    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (validateUserForm(state, state.formErrors)) {
      GroupService.createGroup({ name: state.name, description: state.description })
      setState({
        ...state,
        name: '',
        description: ''
      })
    }
  }

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={() => handleClose(false)}
      onOpen={() => handleClose(true)}
      classes={{ paper: classex.paper }}
    >
      <Container maxWidth="sm" className={classes.container}>
        <DialogTitle id="form-dialog-title" className={classes.texAlign}>
          Create New Group
        </DialogTitle>
        <label>Name</label>
        <Paper component="div" className={state.formErrors.name ? classes.redBorder : classes.createInput}>
          <InputBase
            className={classes.input}
            name="name"
            placeholder="Enter name"
            style={{ color: '#fff' }}
            autoComplete="off"
            value={state.name}
            onChange={handleChange}
          />
        </Paper>
        <Paper component="div" className={state.formErrors.description ? classes.redBorder : classes.createInput}>
          <InputBase
            className={classes.input}
            name="description"
            placeholder="Enter description"
            style={{ color: '#fff' }}
            autoComplete="off"
            value={state.description}
            onChange={handleChange}
          />
        </Paper>

        <DialogActions style={{ marginTop: '10%' }}>
          <Button onClick={handleSubmit} className={classes.saveBtn}>
            Submit
          </Button>
          <Button onClick={() => handleClose(false)} className={classes.saveBtn}>
            Cancel
          </Button>
        </DialogActions>
      </Container>
    </SwipeableDrawer>
  )
}

export default GreateGroup
