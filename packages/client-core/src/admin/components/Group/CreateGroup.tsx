import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import { useStyles } from './styles'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import { formValid } from './validation'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectGroupState } from '../../reducers/admin/group/selector'
import { createGroup } from '../../reducers/admin/group/service'

interface Props {
  open: boolean
  handleClose: (open: boolean) => void
  adminGroupState?: any
  createGroupService?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createGroupService: bindActionCreators(createGroup, dispatch)
})

const CreateGroup = (props: Props) => {
  const { open, handleClose, createGroupService, adminGroupState } = props
  const classes = useStyles()

  const [state, setState] = React.useState({
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
    }

    setState({ ...state, [name]: value, formErrors: temp })
  }

  const onSubmitHandler = (event) => {
    event.preventDefault()
    const { name, description } = state
    let temp = state.formErrors

    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (formValid(state, state.formErrors)) {
      createGroupService({ name, description })
      setState({
        ...state,
        name: '',
        description: ''
      })
    }
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paper }} anchor="right" open={open} onClose={() => handleClose(false)}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <form onSubmit={(e) => onSubmitHandler(e)}>
            <DialogTitle id="form-dialog-title" className={classes.texAlign}>
              Create New Group
            </DialogTitle>
            <label>Name</label>
            <Paper
              component="div"
              className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}
            >
              <InputBase
                className={classes.input}
                name="name"
                placeholder="Enter group name"
                style={{ color: '#fff' }}
                autoComplete="off"
                value={state.name}
                onChange={handleChange}
              />
            </Paper>
            <label>Description</label>
            <Paper
              component="div"
              className={state.formErrors.description.length > 0 ? classes.redBorder : classes.createInput}
            >
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
            <DialogActions className={classes.marginTp}>
              <Button type="submit" className={classes.saveBtn}>
                Submit
              </Button>
              <Button
                onClick={() => {
                  setState({
                    ...state,
                    name: '',
                    description: '',
                    formErrors: { ...state.formErrors, name: '', description: '' }
                  })
                  handleClose(false)
                }}
                className={classes.saveBtn}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default connect(null, mapDispatchToProps)(CreateGroup)
