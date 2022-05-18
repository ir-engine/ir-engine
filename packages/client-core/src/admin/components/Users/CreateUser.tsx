import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { CreateEditUser } from '@xrengine/common/src/interfaces/User'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Drawer from '@mui/material/Drawer'

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
import styles from '../../styles/admin.module.scss'
import CreateUserRole from './CreateUserRole'

interface Props {
  open: boolean
  handleClose: (open: boolean) => void
  closeViewModal: (open: boolean) => void
}

interface InputSelectProps {
  value: string
  label: string
}

const CreateUser = (props: Props) => {
  const { open, closeViewModal } = props
  const { t } = useTranslation()
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
    temp[name] = value.length < 2 ? `${_.upperFirst(name)} ${t('admin:components.user.isRequired')}` : ''
    setState({ ...state, [name]: value, formErrors: temp })
  }

  const handleSubmit = () => {
    const data: CreateEditUser = {
      name: state.name,
      avatarId: state.avatar,
      userRole: state.userRole,
      scopes: state.scopes
    }
    let temp = state.formErrors
    temp.name = !state.name ? t('admin:components.user.nameCantEmpty') : ''
    temp.avatar = !state.avatar ? t('admin:components.user.avatarCantEmpty') : ''
    temp.userRole = !state.userRole ? t('admin:components.user.userRoleCantEmpty') : ''
    temp.scopes = !state.scopes.length ? t('admin:components.user.scopeTypeCantEmpty') : ''
    setState({ ...state, formErrors: temp })
    if (validateForm(state, state.formErrors)) {
      UserService.createUser(data)
      closeViewModal(false)
      clearState()
    } else {
      setError(t('admin:components.user.fillRequiredField'))
      setOpenWarning(true)
    }
  }

  const handleCancel = () => {
    clearState()
    closeViewModal(false)
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
      <Drawer classes={{ paper: styles.paperDrawer }} anchor="right" open={open} onClose={handleCancel}>
        <Container maxWidth="sm" className={styles.mt20}>
          <DialogTitle id="form-dialog-title" className={styles.textAlign}>
            {t('admin:components.user.createNewUser')}
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
          <DialogContentText className={styles.mb15}>
            <span className={styles.select}>{t('admin:components.user.dontSeeUserRole')}</span>{' '}
            <a href="#h" className={styles.textLink} onClick={createUserRole}>
              {t('admin:components.user.createOne')}
            </a>
          </DialogContentText>
          <AutoComplete data={scopeData} label="Grant Scope" handleChangeScopeType={handleChangeScopeType} />
          <DialogActions>
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.user.submit')}
            </Button>
            <Button onClick={handleCancel} className={styles.cancelButton}>
              {t('admin:components.user.cancel')}
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
