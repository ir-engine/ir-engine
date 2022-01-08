import React from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'

import { useAuthState } from '../../../user/services/AuthService'
import { GroupService } from '../../services/GroupService'
import { ScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { useGroupStyle, useGroupStyles } from './styles'
import { formValid } from './validation'

interface Props {
  groupAdmin: any
  closeEditModal: any
  closeViewModal?: any
}

const EditGroup = (props: Props) => {
  const classes = useGroupStyles()
  const classx = useGroupStyle()
  const { groupAdmin, closeEditModal, closeViewModal } = props
  const user = useAuthState().user
  const adminScopeTypeState = useScopeTypeState()
  const adminScopeTypes = adminScopeTypeState.scopeTypes

  const [state, setState] = React.useState({
    name: groupAdmin.name,
    description: groupAdmin.description,
    scopeTypes: groupAdmin.scopes,
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
    const { name, description, scopeTypes } = state
    let temp = state.formErrors

    if (!state.name) {
      temp.name = "Name can't be empty"
    }
    if (!state.description) {
      temp.description = "Description can't be empty"
    }
    if (!state.scopeTypes.length) {
      temp.scopeTypes = "Scope can't be empty"
    }
    setState({ ...state, formErrors: temp })
    if (formValid(state, state.formErrors)) {
      GroupService.patchGroupByAdmin(groupAdmin.id, { name, description, scopeTypes })
      setState({
        ...state,
        name: '',
        description: '',
        scopeTypes: []
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
          className={state.formErrors.scopeTypes.length > 0 ? classes.redBorder : classes.createInput}
        >
          <Autocomplete
            onChange={(event, value) =>
              setState({ ...state, scopeTypes: value, formErrors: { ...state.formErrors, scopeTypes: '' } })
            }
            multiple
            className={classes.selector}
            classes={{ paper: classx.selectPaper, inputRoot: classes.select }}
            id="tags-standard"
            value={state.scopeTypes}
            options={adminScopeTypes.value}
            disableCloseOnSelect
            filterOptions={(options) =>
              options.filter((option) => state.scopeTypes.find((scopeType) => scopeType.type === option.type) == null)
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
