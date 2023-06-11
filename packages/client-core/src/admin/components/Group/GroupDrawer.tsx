import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import AutoComplete, { AutoCompleteData } from '@etherealengine/client-core/src/common/components/AutoComplete'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { CreateGroup, Group, GroupScope } from '@etherealengine/common/src/interfaces/Group'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Avatar from '@etherealengine/ui/src/primitives/mui/Avatar'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogContentText from '@etherealengine/ui/src/primitives/mui/DialogContentText'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import { validateForm } from '../../common/validation/formValidation'
import { AdminGroupService } from '../../services/GroupService'
import { AdminScopeTypeService, AdminScopeTypeState } from '../../services/ScopeTypeService'
import styles from '../../styles/admin.module.scss'

export enum GroupDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: GroupDrawerMode
  selectedGroup?: Group
  onClose: () => void
}

const defaultState = {
  name: '',
  description: '',
  scopeTypes: [] as Array<GroupScope>,
  formErrors: {
    name: '',
    description: '',
    scopeTypes: ''
  }
}

const GroupDrawer = ({ open, mode, selectedGroup, onClose }: Props) => {
  const { t } = useTranslation()
  const editMode = useHookstate(false)
  const state = useHookstate(defaultState)

  const user = useHookstate(getMutableState(AuthState).user).value
  const scopeTypes = useHookstate(getMutableState(AdminScopeTypeState).scopeTypes).get({ noproxy: true })

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'groups:write')
  const viewMode = mode === GroupDrawerMode.ViewEdit && !editMode.value

  const scopeMenu: AutoCompleteData[] = scopeTypes.map((el) => {
    return {
      type: el.type
    }
  })

  if (selectedGroup) {
    for (const scope of selectedGroup.scopes || []) {
      const scopeExists = scopeMenu.find((item) => item.type === scope.type)
      if (!scopeExists) {
        scopeMenu.push({
          type: scope.type
        })
      }
    }
  }

  useEffect(() => {
    AdminScopeTypeService.getScopeTypeService()
  }, [])

  useEffect(() => {
    loadSelectedGroup()
  }, [selectedGroup])

  const loadSelectedGroup = () => {
    if (selectedGroup) {
      state.set({
        ...defaultState,
        name: selectedGroup.name || '',
        description: selectedGroup.description || '',
        scopeTypes: selectedGroup.scopes || []
      })
    }
  }

  const handleCancel = () => {
    if (editMode.value) {
      loadSelectedGroup()
      editMode.set(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    state.set(defaultState)
  }

  const handleChangeScopeType = (scope) => {
    state.formErrors.merge({
      scopeTypes: scope.length < 1 ? t('admin:components.group.scopeTypeRequired') : ''
    })

    state.merge({ scopeTypes: scope })
  }

  const handleSelectAllScopes = () =>
    handleChangeScopeType(
      scopeTypes.map((el) => {
        return { type: el.type }
      })
    )

  const handleClearAllScopes = () => handleChangeScopeType([])

  const handleChange = (e) => {
    const { name, value } = e.target

    switch (name) {
      case 'name':
        state.formErrors.merge({ name: value.length < 2 ? t('admin:components.group.nameRequired') : '' })
        break
      case 'description':
        state.formErrors.merge({ description: value.length < 2 ? t('admin:components.group.descriptionRequired') : '' })
        break
      default:
        break
    }

    state.merge({ [name]: value })
  }

  const handleSubmit = async () => {
    const data: CreateGroup = {
      name: state.name.value,
      description: state.description.value,
      scopes: state.scopeTypes.get({ noproxy: true })
    }

    state.formErrors.merge({
      name: state.name.value ? '' : t('admin:components.group.nameCantEmpty'),
      description: state.description.value ? '' : t('admin:components.group.descriptionCantEmpty'),
      scopeTypes:
        state.scopeTypes.get({ noproxy: true }).length > 0 ? '' : t('admin:components.group.scopeTypeCantEmpty')
    })

    if (validateForm(state.get({ noproxy: true }), state.formErrors.value)) {
      if (mode === GroupDrawerMode.Create) {
        await AdminGroupService.createGroupByAdmin(data)
      } else if (selectedGroup) {
        AdminGroupService.patchGroupByAdmin(selectedGroup.id, data)
        editMode.set(false)
      }

      handleClose()
    } else {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
    }
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>
          {mode === GroupDrawerMode.Create && t('admin:components.group.createGroup')}
          {mode === GroupDrawerMode.ViewEdit &&
            editMode.value &&
            `${t('admin:components.common.update')} ${selectedGroup?.name}`}
          {mode === GroupDrawerMode.ViewEdit && !editMode.value && selectedGroup?.name}
        </DialogTitle>

        <InputText
          name="name"
          label={t('admin:components.group.name')}
          value={state.name.value}
          error={state.formErrors.name.value}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputText
          name="description"
          label={t('admin:components.group.description')}
          value={state.description.value}
          error={state.formErrors.description.value}
          disabled={viewMode}
          onChange={handleChange}
        />

        {viewMode && (
          <AutoComplete
            data={scopeMenu}
            label={t('admin:components.group.grantScope')}
            value={state.scopeTypes.get({ noproxy: true })}
            disabled
          />
        )}

        {!viewMode && (
          <div>
            <AutoComplete
              data={scopeMenu}
              label={t('admin:components.group.grantScope')}
              value={state.scopeTypes.get({ noproxy: true })}
              onChange={handleChangeScopeType}
            />
            <div className={styles.scopeButtons}>
              <Button className={styles.outlinedButton} onClick={handleSelectAllScopes}>
                {t('admin:components.user.selectAllScopes')}
              </Button>
              <Button className={styles.outlinedButton} onClick={handleClearAllScopes}>
                {t('admin:components.user.clearAllScopes')}
              </Button>
            </div>
          </div>
        )}

        {viewMode && (
          <DialogContentText className={`${styles.dialogContentText} ${styles.textAlign}`} sx={{ mb: 2 }}>
            {t('admin:components.group.groupUsers')}
          </DialogContentText>
        )}

        {viewMode && (!selectedGroup || !selectedGroup.scopes) && (
          <DialogContentText className={`${styles.dialogContentText} ${styles.textAlign}`}>
            {t('admin:components.common.none')}
          </DialogContentText>
        )}

        <Grid container sx={{ mb: 1 }}>
          {viewMode &&
            selectedGroup?.groupUsers?.map((groupUser) => (
              <Grid
                item
                key={groupUser.id}
                xs={12}
                md={6}
                sm={6}
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 1 }}
              >
                <Avatar sx={{ textTransform: 'uppercase' }}>{groupUser.user.name.slice(0, 1)}</Avatar>
                <Box sx={{ flexGrow: 1, ml: 1 }}>
                  <Typography>{groupUser.user.name}</Typography>
                  <Typography variant="body2">{groupUser.groupUserRank}</Typography>
                </Box>
              </Grid>
            ))}
        </Grid>

        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === GroupDrawerMode.Create || editMode.value) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === GroupDrawerMode.ViewEdit && !editMode.value && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => editMode.set(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default GroupDrawer
