import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { CreateEditUser, UserInterface } from '@xrengine/common/src/interfaces/User'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete, { AutoCompleteData } from '../../common/AutoComplete'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
import { validateForm } from '../../common/validation/formValidation'
import { AdminScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
import { AdminStaticResourceService, useStaticResourceState } from '../../services/StaticResourceService'
import { AdminUserService } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'

export enum UserDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: UserDrawerMode
  selectedUser?: UserInterface
  onClose: () => void
}

const defaultState = {
  name: '',
  avatar: '',
  isGuest: true,
  scopes: [] as Array<AdminScopeType>,
  formErrors: {
    name: '',
    avatar: '',
    scopes: ''
  }
}

const UserDrawer = ({ open, mode, selectedUser, onClose }: Props) => {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const { user } = useAuthState().value
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
  }

  useEffect(() => {
    AdminStaticResourceService.fetchStaticResource()
    AdminScopeTypeService.getScopeTypeService()
  }, [])

  useEffect(() => {
    loadSelectedUser()
  }, [selectedUser])

  const loadSelectedUser = () => {
    if (selectedUser) {
      setState({
        ...defaultState,
        name: selectedUser.name || '',
        avatar: selectedUser.avatarId || '',
        isGuest: selectedUser.isGuest || true,
        scopes: selectedUser.scopes?.map((el) => ({ type: el.type })) || []
      })
    }
  }

  const handleCancel = () => {
    if (editMode) {
      loadSelectedUser()
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
      default:
        break
    }

    setState({ ...state, [name]: value, formErrors: tempErrors })
  }

  const handleSubmit = async () => {
    const data: CreateEditUser = {
      name: state.name,
      avatarId: state.avatar,
      isGuest: state.isGuest,
      scopes: state.scopes as any
    }

    let tempErrors = {
      ...state.formErrors,
      name: state.name ? '' : t('admin:components.user.nameCantEmpty'),
      avatar: state.avatar ? '' : t('admin:components.user.avatarCantEmpty'),
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

        {viewMode && (
          <>
            <InputText
              label={t('admin:components.user.inviteCode')}
              value={selectedUser?.inviteCode || t('admin:components.common.none')}
              disabled
            />
          </>
        )}

        {viewMode && (
          <FormControlLabel
            className={styles.checkbox}
            control={<Checkbox className={styles.checkedCheckbox} checked={selectedUser?.isGuest} disabled />}
            label={t('admin:components.user.isGuest')}
          />
        )}

        {viewMode && (
          <AutoComplete
            data={scopeMenu}
            label={t('admin:components.user.grantScope')}
            defaultValue={state.scopes}
            disabled
          />
        )}

        {!viewMode && (
          <AutoComplete
            data={scopeMenu}
            label={t('admin:components.user.grantScope')}
            defaultValue={state.scopes}
            onChange={handleChangeScopeType}
          />
        )}

        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === UserDrawerMode.Create || editMode) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === UserDrawerMode.ViewEdit && !editMode && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => setEditMode(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default UserDrawer
