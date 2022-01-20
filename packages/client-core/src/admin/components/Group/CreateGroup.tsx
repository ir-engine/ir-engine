import React from 'react'
import Drawer from '@mui/material/Drawer'
import Container from '@mui/material/Container'
import { useGroupStyles, useGroupStyle } from './styles'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { formValid } from './validation'
import Autocomplete from '@mui/material/Autocomplete'
import { GroupService } from '../../services/GroupService'
import TextField from '@mui/material/TextField'
import { useScopeTypeState, ScopeTypeService } from '../../services/ScopeTypeService'
import { useAuthState } from '../../../user/services/AuthService'

interface Props {
  open: boolean
  handleClose: (open: boolean) => void
  adminGroupState?: any
}

const CreateGroup = (props: Props) => {
  const { open, handleClose } = props
  const classes = useGroupStyles()
  const classx = useGroupStyle()
  const user = useAuthState().user
  const adminScopeTypeState = useScopeTypeState()
  const adminScopeTypes = adminScopeTypeState.scopeTypes

  const [state, setState] = React.useState({
    name: '',
    description: '',
    scopeTypes: [] as any[],
    formErrors: {
      name: '',
      description: '',
      scopeTypes: ''
    }
  })

  React.useEffect(() => {
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      ScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, user])

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
    const { name, description, scopeTypes } = state
    let temp = state.formErrors

    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (formValid(state, state.formErrors)) {
      GroupService.createGroupByAdmin({ name, description, scopeTypes })
      setState({
        ...state,
        name: '',
        description: '',
        scopeTypes: []
      })
    }
    handleClose(false)
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

            <label>Grant access</label>
            <Paper component="div" className={classes.createInput}>
              <Autocomplete
                onChange={(event, value) =>
                  setState({ ...state, scopeTypes: value, formErrors: { ...state.formErrors, scopeTypes: '' } })
                }
                multiple
                className={classes.selector}
                classes={{ paper: classx.selectPaper, inputRoot: classes.select }}
                id="tags-standard"
                options={adminScopeTypes.value}
                disableCloseOnSelect
                filterOptions={(options: any) =>
                  options.filter(
                    (option) => state.scopeTypes.find((scopeType) => scopeType.type === option.type) == null
                  )
                }
                getOptionLabel={(option: any) => option.type}
                renderInput={(params) => <TextField {...params} placeholder="Select access" />}
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

export default CreateGroup
