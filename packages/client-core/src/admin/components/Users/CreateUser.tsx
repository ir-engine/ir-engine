import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useAlertState } from '../../../common/services/AlertService'
import { useAuthState } from '../../../user/services/AuthService'
import AlertMessage from '../../common/AlertMessage'
import AutoComplete from '../../common/AutoComplete'
import { useFetchScopeType, useFetchStaticResource, useFetchUserRole } from '../../common/hooks/User.hooks'
import InputSelect from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { ScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { staticResourceService, useStaticResourceState } from '../../services/StaticResourceService'
import { UserRoleService, useUserRoleState } from '../../services/UserRoleService'
import { UserService } from '../../services/UserService'
import { useStyles } from '../../styles/ui'
import CreateUserRole from './CreateUserRole'

interface Props {
  open: boolean
  handleClose: any
  closeViewModel: any
}

interface InputSelectProps {
  value: string
  label: string
}

const CreateUser = (props: Props) => {
  const { open, handleClose, closeViewModel } = props

  const classes = useStyles()
  const [openCreateUserRole, setOpenCreateUserRole] = useState(false)
  const [state, setState] = React.useState({
    name: '',
    avatar: '',
    userRole: '',
    scopes: [] as Array<AdminScopeType>,
    formErrors: {
      name: '',
      avatar: '',
      userRole: '',
      scopes: ''
    }
  })

  const [openWarning, setOpenWarning] = useState(false)
  const [error, setError] = useState('')

  const user = useAuthState().user
  const userRole = useUserRoleState()
  const staticResource = useStaticResourceState()
  const staticResourceData = staticResource.staticResource

  const adminScopeTypeState = useScopeTypeState()
  const alertState = useAlertState()
  const errorType = alertState.type
  const errorMessage = alertState.message

  //Call custom hooks
  useFetchUserRole(UserRoleService, userRole, user)
  useFetchStaticResource(staticResourceService, staticResource, user)
  useFetchScopeType(ScopeTypeService, adminScopeTypeState, user)

  const clearState = () => {
    setState({
      ...state,
      name: '',
      avatar: '',
      userRole: '',
      scopes: [],
      formErrors: { name: '', avatar: '', userRole: '', scopes: '' }
    })
  }

  useEffect(() => {
    if (errorType.value === 'error') {
      setError(errorMessage.value)
      setOpenWarning(true)
      setTimeout(() => {
        setOpenWarning(false)
      }, 5000)
    }
  }, [errorType.value, errorMessage.value])

  const createUserRole = () => {
    setOpenCreateUserRole(true)
  }

  const handleUserRoleClose = () => {
    setOpenCreateUserRole(false)
  }

  const handleCloseWarning = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenWarning(false)
  }
  const handleChangeScopeType = (scope) => {
    if (scope.length) setState({ ...state, scopes: scope, formErrors: { ...state.formErrors, scopes: '' } })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let temp = state.formErrors
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} is required!` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data = {
      name: state.name,
      avatarId: state.avatar,
      userRole: state.userRole,
      scopes: state.scopes
    }
    let temp = state.formErrors
    temp.name = !state.name ? "Name can't be empty" : ''
    temp.avatar = !state.avatar ? "Avatar can't be empty" : ''
    temp.userRole = !state.userRole ? "User role can't be empty" : ''
    temp.scopes = !state.scopes.length ? "Scope type can't be empty" : ''
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      UserService.createUser(data)
      closeViewModel(false)
      clearState()
    } else {
      setError('Please fill all required field')
      setOpenWarning(true)
    }
  }

  const handleCancel = () => {
    clearState()
    closeViewModel(false)
  }

  interface ScopeData {
    type: string
  }

  const scopeData: ScopeData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  const staticResourceMenu: InputSelectProps[] = staticResourceData.value.map((el) => {
    return {
      label: el.name,
      value: el.name
    }
  })

  const userRoleData: InputSelectProps[] = userRole.userRole.value.map((el) => {
    return {
      value: el.role,
      label: el.role
    }
  })

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classes.paperDrawer }} anchor="right" open={open} onClose={handleCancel}>
        <Container maxWidth="sm" className={classes.marginTp}>
          <DialogTitle id="form-dialog-title" className={classes.texAlign}>
            Create New User
          </DialogTitle>
          <InputText
            value={state.name}
            formErrors={state.formErrors.name}
            handleInputChange={handleChange}
            name="name"
          />
          <InputSelect
            formErrors={state.formErrors.avatar}
            value={state.avatar}
            handleInputChange={handleChange}
            name="avatar"
            menu={staticResourceMenu}
          />
          <InputSelect
            handleInputChange={handleChange}
            value={state.userRole}
            name="userRole"
            menu={userRoleData}
            formErrors={state.formErrors.userRole}
          />
          <DialogContentText className={classes.marginBottm}>
            <span className={classes.select}>Don't see user role? </span>{' '}
            <a href="#h" className={classes.textLink} onClick={createUserRole}>
              Create One
            </a>
          </DialogContentText>
          <AutoComplete data={scopeData} label="Grant Scope" handleChangeScopeType={handleChangeScopeType} />
          <DialogActions>
            <Button className={classes.saveBtn} onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={handleCancel} className={classes.saveBtn}>
              Cancel
            </Button>
          </DialogActions>
        </Container>
      </Drawer>
      <CreateUserRole open={openCreateUserRole} handleClose={handleUserRoleClose} />
      <AlertMessage open={openWarning} handleClose={handleCloseWarning} severity="warning" message={error} />
    </React.Fragment>
  )
}

export default CreateUser
