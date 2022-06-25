import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { CreateEditUser, User } from '@xrengine/common/src/interfaces/User'

import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete, { AutoCompleteData } from '../../common/AutoComplete'
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

export enum UserDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: UserDrawerMode
  selectedUser?: User
  onClose: () => void
}

const defaultState = {
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
}

const UserDrawer = ({ open, mode, selectedUser, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })
  const [openCreateUserRole, setOpenCreateUserRole] = useState(false)

  const { user } = useAuthState().value
  const { userRole } = useAdminUserRoleState().value
  const { staticResource } = useStaticResourceState().value
  const { scopeTypes } = useScopeTypeState().value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'user:write')
  const viewMode = mode === UserDrawerMode.ViewEdit && editMode === false

  const scopeMenu: AutoCompleteData[] = scopeTypes.map((el) => {
    return {
      type: el.type
    }
  })

  const staticResourceMenu: InputMenuItem[] = staticResource.map((el) => {
    return {
      label: el.name,
      value: el.name
    }
  })

  const userRoleMenu: InputMenuItem[] = userRole.map((el) => {
    return {
      value: el.role,
      label: el.role
    }
  })

  if (selectedUser) {
    for (const scope of selectedUser.scopes || []) {
      const scopeExists = scopeMenu.find((item) => item.type === scope.type)
      if (!scopeExists) {
        scopeMenu.push({
          type: scope.type
        })
      }
    }

    const staticResourceExists = staticResourceMenu.find((item) => item.value === selectedUser.avatarId)
    if (!staticResourceExists) {
      staticResourceMenu.push({
        value: selectedUser.avatarId!,
        label: selectedUser.avatarId!
      })
    }

    const userRoleExists = userRoleMenu.find((item) => item.value === selectedUser.userRole)
    if (!userRoleExists) {
      userRoleMenu.push({
        value: selectedUser.userRole!,
        label: selectedUser.userRole!
      })
    }
  }

  useEffect(() => {
    AdminStaticResourceService.fetchStaticResource()
    AdminScopeTypeService.getScopeTypeService()
    AdminUserRoleService.fetchUserRole()
  }, [])

  useEffect(() => {
    loadUser()
  }, [selectedUser])

  const loadUser = () => {
    if (selectedUser) {
      setState({
        ...defaultState,
        name: selectedUser.name || '',
        avatar: selectedUser.avatarId || '',
        userRole: selectedUser.userRole || '',
        scopes: selectedUser.scopes?.map((el) => ({ type: el.type })) || []
      })
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadUser()
      setEditMode(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    setState({ ...defaultState })
  }

  const handleChangeScopeType = (scope) => {
    let tempErrors = {
      ...state.formErrors,
      scopes: scope.length < 1 ? t('admin:components.user.scopeTypeRequired') : ''
    }

    setState({ ...state, scopes: scope, formErrors: tempErrors })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    let tempErrors = { ...state.formErrors }

    switch (name) {
      case 'name':
        tempErrors.name = value.length < 2 ? t('admin:components.user.nameRequired') : ''
        break
      case 'avatar':
        tempErrors.avatar = value.length < 2 ? t('admin:components.user.avatarRequired') : ''
        break
      case 'userRole':
        tempErrors.userRole = value.length < 2 ? t('admin:components.user.scopeTypeRequired') : ''
        break
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = async () => {
    const data: CreateEditUser = {
      name: state.name,
      avatarId: state.avatar,
      userRole: state.userRole,
      scopes: state.scopes
    }

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.user.nameCantEmpty'),
      avatar: state.avatar ? '' : t('admin:components.user.avatarCantEmpty'),
      userRole: state.userRole ? '' : t('admin:components.user.userRoleCantEmpty'),
      scopes: state.scopes.length > 0 ? '' : t('admin:components.user.scopeTypeCantEmpty')
    }

    setState({ ...state, formErrors: tempErrors })

    if (validateForm(state, tempErrors)) {
      if (mode === UserDrawerMode.Create) {
        await AdminUserService.createUser(data)
      } else if (selectedUser) {
        AdminUserService.patchUser(selectedUser.id, data)
        setEditMode(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <React.Fragment>
      <DrawerView open={open} onClose={handleCancel}>
        <Container maxWidth="sm" className={styles.mt20}>
          <DialogTitle className={styles.textAlign}>
            {mode === UserDrawerMode.Create && t('admin:components.user.createUser')}
            {mode === UserDrawerMode.ViewEdit &&
              editMode &&
              `${t('admin:components.common.update')} ${selectedUser?.name}`}
            {mode === UserDrawerMode.ViewEdit && !editMode && selectedUser?.name}
          </DialogTitle>

          <InputText
            name="name"
            label={t('admin:components.user.name')}
            value={state.name}
            error={state.formErrors.name}
            disabled={viewMode}
            onChange={handleChange}
          />

          <InputSelect
            name="avatar"
            label={t('admin:components.user.avatar')}
            value={state.avatar}
            error={state.formErrors.avatar}
            menu={staticResourceMenu}
            disabled={viewMode}
            onChange={handleChange}
          />

          <InputSelect
            name="userRole"
            label={t('admin:components.user.userRole')}
            value={state.userRole}
            error={state.formErrors.userRole}
            menu={userRoleMenu}
            disabled={viewMode}
            onChange={handleChange}
          />

          {viewMode && (
            <>
              <InputText
                label={t('admin:components.user.location')}
                value={selectedUser?.party?.location?.name || t('admin:components.index.none')}
                disabled
              />

              <InputText
                label={t('admin:components.user.inviteCode')}
                value={selectedUser?.inviteCode || t('admin:components.index.none')}
                disabled
              />

              <InputText
                label={t('admin:components.user.instance')}
                value={selectedUser?.party?.instance?.ipAddress || t('admin:components.index.none')}
                disabled
              />
            </>
          )}

          {viewMode === false && (
            <DialogContentText className={styles.mb15}>
              <span className={styles.select}>{t('admin:components.user.dontSeeUserRole')}</span>{' '}
              <a href="#" className={styles.textLink} onClick={() => setOpenCreateUserRole(true)}>
                {t('admin:components.user.createOne')}
              </a>
            </DialogContentText>
          )}

          {viewMode && (
            <AutoComplete
              data={scopeMenu}
              label={t('admin:components.user.grantScope')}
              defaultValue={state.scopes}
              disabled
            />
          )}

          {viewMode === false && (
            <AutoComplete
              data={scopeMenu}
              label={t('admin:components.user.grantScope')}
              defaultValue={state.scopes}
              onChange={handleChangeScopeType}
            />
          )}

          <DialogActions>
            {(mode === UserDrawerMode.Create || editMode) && (
              <Button className={styles.submitButton} onClick={handleSubmit}>
                {t('admin:components.common.submit')}
              </Button>
            )}
            {mode === UserDrawerMode.ViewEdit && editMode === false && (
              <Button
                className={styles.submitButton}
                disabled={hasWriteAccess ? false : true}
                onClick={() => setEditMode(true)}
              >
                {t('admin:components.common.edit')}
              </Button>
            )}
            <Button className={styles.cancelButton} onClick={handleCancel}>
              {t('admin:components.common.cancel')}
            </Button>
          </DialogActions>
        </Container>
      </DrawerView>

      <CreateUserRole open={openCreateUserRole} onClose={() => setOpenCreateUserRole(false)} />
    </React.Fragment>
  )
}

export default UserDrawer
