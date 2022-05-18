import React from 'react'
import Button from '@material-ui/core/Button'
import Drawer from '@mui/material/Drawer'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import DialogTitle from '@mui/material/DialogTitle'
import { DialogActions } from '@mui/material'
import { validateCreatorForm } from './validation'
import { useCreatorStyle, useCreatorStyles } from './styles'
import { useDispatch } from '@xrengine/client-core/src/store'

import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'

interface Props {
  open: boolean
  handleClose: any
  closeViewModel: any
}

const CreateCreator = (props: Props) => {
  const { open, handleClose, closeViewModel } = props
  const classes = useCreatorStyles()
  const classesx = useCreatorStyle()
  const dispatch = useDispatch()
  const [state, setState] = React.useState({
    name: '',
    username: '',
    email: '',
    twitter: '',
    formErrors: {
      name: '',
      username: '',
      email: '',
      twitter: ''
    }
  })

  const [error, setError] = React.useState('')

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
      default:
        break
    }
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      id: '',
      name: state.name,
      username: state.username,
      email: state.email,
      twitter: state.twitter
    }

    let temp = state.formErrors
    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.username) {
      temp.username = "Username can't be empty"
    }
    if (!state.email) {
      temp.email = "E-mail can't be empty"
    }
    if (!state.twitter) {
      temp.twitter = "Twitter can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (validateCreatorForm(state, state.formErrors)) {
      CreatorService.createCreator(data)
      // closeViewModel(false)
      setState({
        ...state,
        name: '',
        username: '',
        email: '',
        twitter: ''
      })
    } else {
      setError('Please fill all required field')
    }
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={open} onClose={handleClose(false)}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <DialogTitle id="form-dialog-title" className={classes.texAlign}>
            Create New Creator
          </DialogTitle>
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
          <DialogActions className={classes.marginTp}>
            <Button className={classesx.saveBtn} onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={handleClose(false)} className={classesx.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default CreateCreator
