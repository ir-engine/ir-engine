import React from 'react'
import Container from '@mui/material/Container'
import { useCreatorStyle, useCreatorStyles } from './styles'
import { Typography, Paper, Button } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import { DialogActions } from '@mui/material'

import { useDispatch } from '@xrengine/client-core/src/store'
import { validateCreatorForm } from './validation'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'

interface Props {
  adminCreator: any
  closeEditModal: any
}

const EditCreator = (props: Props) => {
  const classesx = useCreatorStyle()
  const classes = useCreatorStyles()
  const { adminCreator, closeEditModal } = props
  const id = adminCreator.id
  const dispatch = useDispatch()

  const [state, setState] = React.useState({
    name: adminCreator.name,
    username: adminCreator.username,
    email: adminCreator.email,
    twitter: adminCreator.twitter,
    bio: adminCreator.bio,
    formErrors: {
      name: '',
      username: '',
      email: '',
      twitter: '',
      bio: ''
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors

    switch (name) {
      case 'name':
        temp.name = value.length < 2 ? 'Name is required!' : ''
        break
      case 'username':
        temp.username = value.length < 2 ? 'Username is required!' : ''
        break
      case 'email':
        temp.email = value.length < 2 ? 'Username is required!' : ''
        break
      case 'twitter':
        temp.twitter = value.length < 2 ? 'Twitter is required!' : ''
        break
      case 'bio':
        temp.bio = value.length < 2 ? 'Description is required!' : ''
        break

      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const { name, username, email, twitter, bio } = state
    const temp = state.formErrors

    if (!state.name) {
      temp.name = 'Name is required'
    }

    if (!state.email) {
      temp.email = 'Email is required'
    }

    if (!state.twitter) {
      temp.name = 'Twitter is required'
    }

    if (!state.username) {
      temp.name = 'Username is required'
    }

    if (!state.bio) {
      temp.name = 'Description is required'
    }

    setState({ ...state, formErrors: temp })
    if (validateCreatorForm(state, state.formErrors)) {
      CreatorService.updateCreator({ id, name, username, email, twitter, bio })
      setState({
        ...state,
        name: '',
        username: '',
        twitter: '',
        email: '',
        bio: ''
      })
    }
  }

  return (
    <React.Fragment>
      <Paper elevation={3} className={classes.paperHeight}>
        <Container maxWidth="sm">
          <div className={classes.center}>
            <Typography variant="h4" component="span" className={classes.typo}>
              Update Creator Information
            </Typography>
          </div>
        </Container>
      </Paper>
      <Container maxWidth="sm" className={classes.marginTop}>
        <form onSubmit={(e) => handleSubmit(e)}>
          <label>Name</label>
          <Paper component="div" className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
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
          <label>Username</label>
          <Paper
            component="div"
            className={state.formErrors.username.length > 0 ? classes.redBorder : classes.createInput}
          >
            <InputBase
              className={classes.input}
              name="username"
              placeholder="Enter username"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.username}
              onChange={handleChange}
            />
          </Paper>
          <label>Email</label>
          <Paper
            component="div"
            className={state.formErrors.email.length > 0 ? classes.redBorder : classes.createInput}
          >
            <InputBase
              className={classes.input}
              name="email"
              placeholder="Enter email"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.email}
              onChange={handleChange}
            />
          </Paper>
          <label>Twitter</label>
          <Paper
            component="div"
            className={state.formErrors.twitter.length > 0 ? classes.redBorder : classes.createInput}
          >
            <InputBase
              className={classes.input}
              name="twitter"
              placeholder="Enter Twitter"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.twitter}
              onChange={handleChange}
            />
          </Paper>
          <label>Description</label>
          <Paper component="div" className={state.formErrors.bio.length > 0 ? classes.redBorder : classes.createInput}>
            <InputBase
              className={classes.input}
              name="bio"
              placeholder="Enter Twitter"
              style={{ color: '#fff' }}
              autoComplete="off"
              value={state.bio}
              onChange={handleChange}
            />
          </Paper>
          <DialogActions className={classes.marginTp}>
            <Button type="submit" className={classesx.saveBtn}>
              Submit
            </Button>
            <Button
              onClick={() => {
                setState({
                  ...state,
                  name: '',
                  username: '',
                  email: '',
                  twitter: '',
                  bio: ''
                })
                closeEditModal()
              }}
              className={classesx.saveBtn}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Container>
    </React.Fragment>
  )
}

export default EditCreator
