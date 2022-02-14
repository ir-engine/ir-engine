import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
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
  open: boolean
  handleClose: (open: boolean) => void
  adminGroupState?: any
}

interface ScopeData {
  type: string
}

const CreateGroup = (props: Props) => {
  const { open, handleClose } = props
  const classes = useStyles()
  const user = useAuthState().user
  const adminScopeTypeState = useScopeTypeState()
  const adminScopeTypes = adminScopeTypeState.scopeTypes

  const [state, setState] = useState({
    name: '',
    description: '',
    scopeTypes: [] as any[],
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

  const handleChange = (event) => {
    const { name, value } = event.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const onSubmitHandler = (event) => {
    event.preventDefault()
    const { name, description, scopeTypes } = state
    let temp = state.formErrors
    temp.name = !state.name ? "Name can't be empty" : ''
    temp.description = !state.description ? "Description can't be empty" : ''
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      GroupService.createGroupByAdmin({ name, description, scopeTypes })
      setState({
        ...state,
        name: '',
        description: '',
        scopeTypes: []
      })
      handleClose(false)
    }
  }

  const scopeData: ScopeData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  const handleChangeScopeType = (scope) => {
    if (scope.length) setState({ ...state, scopeTypes: scope, formErrors: { ...state.formErrors, scopeTypes: '' } })
  }

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paperDrawer }} anchor="right" open={open} onClose={() => handleClose(false)}>
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
            <AutoComplete data={scopeData} label="Grant Scope" handleChangeScopeType={handleChangeScopeType} />
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
