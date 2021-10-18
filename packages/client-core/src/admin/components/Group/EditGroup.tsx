import React from 'react'
import Container from '@material-ui/core/Container'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import { formValid } from './validation'
import { bindActionCreators, Dispatch } from 'redux'
import { useDispatch } from '../../../store'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { ScopeService } from '../../state/ScopeService'
import { useScopeState } from '../../state/ScopeState'
import { useAuthState } from '../../../user/state/AuthState'
import { GroupService } from '../../state/GroupService'
import { useGroupStyles, useGroupStyle } from './styles'

interface Props {
  groupAdmin: any
  closeEditModal: any
  closeViewModal?: any
}

const EditGroup = (props: Props) => {
  const classes = useGroupStyles()
  const classx = useGroupStyle()
  const dispatch = useDispatch()
  const { groupAdmin, closeEditModal, closeViewModal } = props
  const user = useAuthState().user
  const adminScopeState = useScopeState()
  const adminScopes = adminScopeState.scopeType.scopeType

  const [state, setState] = React.useState({
    name: groupAdmin.name,
    description: groupAdmin.description,
    scopeType: groupAdmin.scopes,
    formErrors: {
      name: '',
      description: '',
      scopeType: ''
    }
  })

  React.useEffect(() => {
    if (adminScopeState.scopeType.updateNeeded.value && user.id.value) {
      ScopeService.getScopeTypeService()
    }
  }, [adminScopeState.scopeType.updateNeeded.value, user])

  const handleChange = (e) => {
    const { name, value } = e.target
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

  const onSubmitHandler = (e) => {
    e.preventDefault()
    const { name, description, scopeType } = state
    let temp = state.formErrors

    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    if (!state.scopeType.length) {
      temp.scopeType = "Scope can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (formValid(state, state.formErrors)) {
      GroupService.patchGroupByAdmin(groupAdmin.id, { name, description, scopeType })
      setState({
        ...state,
        name: '',
        description: '',
        scopeType: []
      })
      closeEditModal(false)
      if (typeof closeViewModal === 'function') closeViewModal()
    }
  }

  return (
    <Container maxWidth="sm" className={classes.marginTp}>
      <form onSubmit={(e) => onSubmitHandler(e)}>
        <DialogTitle id="form-dialog-title" className={classes.texAlign}>
          Edit Group
        </DialogTitle>
        <label>Name</label>
        <Paper component="div" className={state.formErrors.name.length > 0 ? classes.redBorder : classes.createInput}>
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

        <label>Grant Scope</label>
        <Paper
          component="div"
          className={state.formErrors.scopeType.length > 0 ? classes.redBorder : classes.createInput}
        >
          <Autocomplete
            onChange={(event, value) =>
              setState({ ...state, scopeType: value, formErrors: { ...state.formErrors, scopeType: '' } })
            }
            multiple
            className={classes.selector}
            classes={{ paper: classx.selectPaper, inputRoot: classes.select }}
            id="tags-standard"
            value={state.scopeType}
            options={adminScopes.value}
            disableCloseOnSelect
            filterOptions={(options) =>
              options.filter((option) => state.scopeType.find((scopeType) => scopeType.type === option.type) == null)
            }
            getOptionLabel={(option) => option.type}
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
              closeEditModal(false)
            }}
            className={classes.saveBtn}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Container>
  )
}

export default EditGroup
