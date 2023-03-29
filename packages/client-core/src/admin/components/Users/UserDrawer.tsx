import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import AutoComplete, { AutoCompleteData } from '@etherealengine/client-core/src/common/components/AutoComplete'
import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { AdminScopeType } from '@etherealengine/common/src/interfaces/AdminScopeType'
import { CreateEditUser, UserInterface } from '@etherealengine/common/src/interfaces/User'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/Button'
import Checkbox from '@etherealengine/ui/src/Checkbox'
import Container from '@etherealengine/ui/src/Container'
import DialogActions from '@etherealengine/ui/src/DialogActions'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import FormControlLabel from '@etherealengine/ui/src/FormControlLabel'
import Grid from '@etherealengine/ui/src/Grid'
import Icon from '@etherealengine/ui/src/Icon'
import Tooltip from '@etherealengine/ui/src/Tooltip'
import Typography from '@etherealengine/ui/src/Typography'

import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import { validateForm } from '../../common/validation/formValidation'
import { AdminAvatarService, AdminAvatarState } from '../../services/AvatarService'
import { AdminScopeTypeService, AdminScopeTypeState } from '../../services/ScopeTypeService'
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
  id: '',
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
  const editMode = useHookstate(false)
  const state = useHookstate({ ...defaultState })

  const user = useHookstate(getMutableState(AuthState).user)
  const avatars = useHookstate(getMutableState(AdminAvatarState).avatars)
  const scopeTypes = useHookstate(getMutableState(AdminScopeTypeState).scopeTypes)

  const hasWriteAccess = user.scopes.get({ noproxy: true })?.find((item) => item.type === 'user:write')
  const viewMode = mode === UserDrawerMode.ViewEdit && !editMode.value

  const scopeMenu: AutoCompleteData[] = scopeTypes.value.map((el) => {
    return {
      type: el.type
    }
  })

  const avatarMenu: InputMenuItem[] = avatars.get({ noproxy: true }).map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const nonGuestLinkedIP = selectedUser?.identity_providers?.filter((ip) => ip.type !== 'guest')
  const discordIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'discord')
  const googleIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'google')
  const facebookIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'facebook')
  const twitterIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'twitter')
  const linkedinIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'linkedin')
  const githubIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'github')
  const emailIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'email')
  const smsIp = selectedUser?.identity_providers?.find((ip) => ip.type === 'sms')

  if (selectedUser) {
    for (const scope of selectedUser.scopes || []) {
      const scopeExists = scopeMenu.find((item) => item.type === scope.type)
      if (!scopeExists) {
        scopeMenu.push({
          type: scope.type
        })
      }
    }

    const avatarExists = avatars.get({ noproxy: true }).find((item) => item.id === selectedUser.avatarId)
    if (!avatarExists) {
      avatarMenu.push({
        value: selectedUser.avatarId!,
        label: selectedUser.avatarId!
      })
    }
  }

  useEffect(() => {
    AdminAvatarService.fetchAdminAvatars()
    AdminScopeTypeService.getScopeTypeService()
  }, [])

  useEffect(() => {
    loadSelectedUser()
  }, [selectedUser])

  const loadSelectedUser = () => {
    if (selectedUser) {
      state.set({
        ...defaultState,
        id: selectedUser.id,
        name: selectedUser.name || '',
        avatar: selectedUser.avatarId || '',
        isGuest: selectedUser.isGuest,
        scopes: selectedUser.scopes?.map((el) => ({ type: el.type })) || []
      })
    }
  }

  const handleCancel = () => {
    if (editMode.value) {
      loadSelectedUser()
      editMode.set(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    state.set({ ...defaultState })
  }

  const handleChangeScopeType = (scope) => {
    state.merge({ scopes: scope })
  }

  const handleSelectAllScopes = () =>
    handleChangeScopeType(
      scopeTypes.value.map((el) => {
        return { type: el.type }
      })
    )

  const handleClearAllScopes = () => handleChangeScopeType([])

  const handleChange = (e) => {
    const { name, value } = e.target

    state.merge({ [name]: value })

    if (name === 'name')
      state.formErrors.merge({ name: value.length < 2 ? t('admin:components.user.nameRequired') : '' })
    if (name === 'avatar')
      state.formErrors.merge({ name: value.length < 2 ? t('admin:components.user.avatarRequired') : '' })
  }

  const handleSubmit = async () => {
    const data: CreateEditUser = {
      name: state.name.value,
      avatarId: state.avatar.value,
      isGuest: state.isGuest.value,
      scopes: state.scopes.get({ noproxy: true })
    }

    state.formErrors.merge({
      name: state.name.value ? '' : t('admin:components.user.nameCantEmpty'),
      avatar: state.avatar.value ? '' : t('admin:components.user.avatarCantEmpty')
    })

    if (validateForm(state.value, state.formErrors.value)) {
      if (mode === UserDrawerMode.Create) {
        await AdminUserService.createUser(data)
      } else if (selectedUser) {
        AdminUserService.patchUser(selectedUser.id, data)
        editMode.set(false)
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
            editMode.value &&
            `${t('admin:components.common.update')} ${selectedUser?.name}`}
          {mode === UserDrawerMode.ViewEdit && !editMode.value && selectedUser?.name}
        </DialogTitle>

        <InputText name="id" label={t('admin:components.user.id')} value={state.id.value} disabled />

        <InputText
          name="name"
          label={t('admin:components.user.name')}
          value={state.name.value}
          error={state.formErrors.name.value}
          disabled={viewMode}
          onChange={handleChange}
        />

        <InputSelect
          name="avatar"
          label={t('admin:components.user.avatar')}
          value={state.avatar.value}
          error={state.formErrors.avatar.value}
          menu={avatarMenu}
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

        {nonGuestLinkedIP && nonGuestLinkedIP.length > 0 && (
          <Grid container spacing={1} sx={{ marginTop: 2, marginBottom: 4 }}>
            <Grid item md={12}>
              <Typography variant="body1">{t('admin:components.user.linkedAccounts')}</Typography>
            </Grid>
            {discordIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.discord')} arrow>
                  <DiscordIcon width="20px" height="20px" viewBox="0 0 40 40" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {discordIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {googleIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.google')} arrow>
                  <GoogleIcon width="20px" height="20px" viewBox="0 0 40 40" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {googleIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {facebookIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.facebook')} arrow>
                  <Icon type="Facebook" width="20px" height="20px" viewBox="0 0 40 40" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {facebookIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {twitterIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.twitter')} arrow>
                  <Icon type="Twitter" width="20px" height="20px" viewBox="0 0 40 40" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {twitterIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {linkedinIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.linkedIn')} arrow>
                  <LinkedInIcon width="20px" height="20px" viewBox="0 0 40 40" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {linkedinIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {githubIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.github')} arrow>
                  <Icon type="GitHub" width="20px" height="20px" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {githubIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {emailIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.email')} arrow>
                  <Icon type="Email" width="20px" height="20px" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {emailIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {smsIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.sms')} arrow>
                  <Icon type="Phone" width="20px" height="20px" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {smsIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}

        {viewMode && (
          <AutoComplete
            data={scopeMenu}
            label={t('admin:components.user.grantScope')}
            value={state.scopes.get({ noproxy: true })}
            disabled
          />
        )}

        {!viewMode && (
          <div>
            <AutoComplete
              data={scopeMenu}
              label={t('admin:components.user.grantScope')}
              value={state.scopes.get({ noproxy: true })}
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

        <DialogActions>
          <Button className={styles.outlinedButton} onClick={handleCancel}>
            {t('admin:components.common.cancel')}
          </Button>
          {(mode === UserDrawerMode.Create || editMode.value) && (
            <Button className={styles.gradientButton} onClick={handleSubmit}>
              {t('admin:components.common.submit')}
            </Button>
          )}
          {mode === UserDrawerMode.ViewEdit && !editMode.value && (
            <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => editMode.set(true)}>
              {t('admin:components.common.edit')}
            </Button>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default UserDrawer
