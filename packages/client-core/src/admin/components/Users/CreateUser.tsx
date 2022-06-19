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

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete from '../../common/AutoComplete'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { AdminStaticResourceService, useStaticResourceState } from '../../services/StaticResourceService'
import { AdminUserRoleService, useAdminUserRoleState } from '../../services/UserRoleService'
import { AdminUserService } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import CreateUserRole from './CreateUserRole'

interface Props {
  open: boolean
  onClose: () => void
}

const CreateUser = ({ open, onClose }: Props) => {
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

  const user = useAuthState().user
  const userRole = useAdminUserRoleState()
  const staticResource = useStaticResourceState()
  const staticResourceData = staticResource.staticResource

  const adminScopeTypeState = useScopeTypeState()

  useEffect(() => {
    const fetchData = async () => {
      AdminUserRoleService.fetchUserRole()
    }
    const role = userRole ? userRole.updateNeeded.value : false
    if (role && user.id.value) fetchData()
  }, [userRole.updateNeeded.value, user.value])

  useEffect(() => {
    if (user.id.value && staticResource.updateNeeded.value) {
      AdminStaticResourceService.fetchStaticResource()
    }
  }, [staticResource.updateNeeded.value, user.value])

  useEffect(() => {
    if (adminScopeTypeState.updateNeeded.value && user.id.value) {
      AdminScopeTypeService.getScopeTypeService()
    }
  }, [adminScopeTypeState.updateNeeded.value, user.value])

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

  const createUserRole = () => {
    setOpenCreateUserRole(true)
  }

  const handleUserRoleClose = () => {
    setOpenCreateUserRole(false)
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
      AdminUserService.createUser(data)
      clearState()
      onClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.user.fillRequiredField'), { variant: 'error' })
    }
  }

  const handleCancel = () => {
    clearState()
    onClose()
  }

  interface ScopeData {
    type: string
  }

  const scopeData: ScopeData[] = adminScopeTypeState.scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  const staticResourceMenu: InputMenuItem[] = staticResourceData.value.map((el) => {
    return {
      label: el.name,
      value: el.name
    }
  })

  const userRoleData: InputMenuItem[] = userRole.userRole.value.map((el) => {
    return {
      value: el.role,
      label: el.role
    }
  })

  return (
    <React.Fragment>
      <DrawerView open={open} onClose={handleCancel}>
        <Container maxWidth="sm" className={styles.mt20}>
          <DialogTitle id="form-dialog-title" className={styles.textAlign}>
            {t('admin:components.user.createNewUser')}
          </DialogTitle>
          <InputText
            name="name"
            label={t('admin:components.user.name')}
            value={state.name}
            error={state.formErrors.name}
            onChange={handleChange}
          />
          <InputSelect
            name="avatar"
            label={t('admin:components.user.avatar')}
            value={state.avatar}
            error={state.formErrors.avatar}
            menu={staticResourceMenu}
            onChange={handleChange}
          />
          <InputSelect
            name="userRole"
            label={t('admin:components.user.userRole')}
            value={state.userRole}
            error={state.formErrors.userRole}
            menu={userRoleData}
            onChange={handleChange}
          />
          <DialogContentText className={styles.mb15}>
            <span className={styles.select}>{t('admin:components.user.dontSeeUserRole')}</span>{' '}
            <a href="#h" className={styles.textLink} onClick={createUserRole}>
              {t('admin:components.user.createOne')}
            </a>
          </DialogContentText>
          <AutoComplete
            data={scopeData}
            label={t('admin:components.user.grantScope')}
            handleChangeScopeType={handleChangeScopeType}
          />
          <DialogActions>
            <Button className={styles.submitButton} onClick={handleSubmit}>
              {t('admin:components.user.submit')}
            </Button>
            <Button onClick={handleCancel} className={styles.cancelButton}>
              {t('admin:components.user.cancel')}
            </Button>
          </DialogActions>
        </Container>
      </DrawerView>
      <CreateUserRole open={openCreateUserRole} handleClose={handleUserRoleClose} />
    </React.Fragment>
  )
}

export default CreateUser
