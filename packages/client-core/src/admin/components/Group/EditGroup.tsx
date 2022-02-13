import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete from '../../common/AutoComplete'
import { validateForm } from '../../common/validation/formValidation'
import { GroupService } from '../../services/GroupService'
import { ScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { useStyles } from '../../styles/ui'

interface Props {
  groupAdmin: any
  closeEditModal: any
  closeViewModal?: any
}
interface ScopeData {
  type: string
}

const EditGroup = (props: Props) => {
  const classes = useStyles()
  const { groupAdmin, closeEditModal, closeViewModal } = props
  const user = useAuthState().user
  const adminScopeTypeState = useScopeTypeState()
  const adminScopeTypes = adminScopeTypeState.scopeTypes

  const [state, setState] = useState({
    name: groupAdmin.name,
    description: groupAdmin.description,
    scopeTypes: groupAdmin.scopes,
    formErrors: {
      name: '',
      description: '',
      scopeTypes: ''
    }
  })

  useEffect(() => {
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      ScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    const { name, description, scopeTypes } = state
    let temp = state.formErrors
    temp.name = !state.name ? "Name can't be empty" : ''
    temp.description = !state.description ? "Description can't be empty" : ''
    temp.scopeTypes = !state.scopeTypes.length ? "Scope can't be empty" : ''

    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
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
  const handleChangeScopeType = (scope) => {
    setState({ ...state, scopeTypes: scope, formErrors: { ...state.formErrors, scopeTypes: '' } })
  }

  const scopeData: ScopeData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

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

        <AutoComplete
          data={scopeData}
          label="Grant Scope"
          handleChangeScopeType={handleChangeScopeType}
          scopes={state.scopeTypes as any}
        />

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
