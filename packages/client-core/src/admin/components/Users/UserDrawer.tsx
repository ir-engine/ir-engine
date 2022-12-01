import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@xrengine/client-core/src/common/components/InputText'
import { AdminScopeType } from '@xrengine/common/src/interfaces/AdminScopeType'
import { CreateEditUser, UserInterface } from '@xrengine/common/src/interfaces/User'

import EmailIcon from '@mui/icons-material/Email'
import GitHubIcon from '@mui/icons-material/GitHub'
import PhoneIcon from '@mui/icons-material/Phone'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import AutoComplete, { AutoCompleteData } from '../../common/AutoComplete'
import DrawerView from '../../common/DrawerView'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import { validateForm } from '../../common/validation/formValidation'
import { AdminAvatarService, useAdminAvatarState } from '../../services/AvatarService'
import { AdminScopeTypeService, useScopeTypeState } from '../../services/ScopeTypeService'
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
  const [editMode, setEditMode] = useState(false)
  const [state, setState] = useState({ ...defaultState })

  const { user } = useAuthState().value
  const { avatars } = useAdminAvatarState().value
  const { scopeTypes } = useScopeTypeState().value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'user:write')
  const viewMode = mode === UserDrawerMode.ViewEdit && !editMode

  const scopeMenu: AutoCompleteData[] = scopeTypes.map((el) => {
    return {
      type: el.type
    }
  })

  const avatarMenu: InputMenuItem[] = avatars.map((el) => {
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

    const avatarExists = avatars.find((item) => item.id === selectedUser.avatarId)
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
      setState({
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
      ...state.formErrors
    }

    setState({ ...state, scopes: scope, formErrors: tempErrors })
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
      avatar: state.avatar ? '' : t('admin:components.user.avatarCantEmpty')
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

        <InputText name="id" label={t('admin:components.user.id')} value={state.id} disabled />

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
                  <span>
                    <DiscordIcon width="20px" height="20px" viewBox="0 0 40 40" />
                  </span>
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {discordIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {googleIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.google')} arrow>
                  <span>
                    <GoogleIcon width="20px" height="20px" viewBox="0 0 40 40" />
                  </span>
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {googleIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {facebookIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.facebook')} arrow>
                  <span>
                    <FacebookIcon width="20px" height="20px" viewBox="0 0 40 40" />
                  </span>
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {facebookIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {twitterIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.twitter')} arrow>
                  <span>
                    <TwitterIcon width="20px" height="20px" viewBox="0 0 40 40" />
                  </span>
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {twitterIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {linkedinIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.linkedIn')} arrow>
                  <span>
                    <LinkedInIcon width="20px" height="20px" viewBox="0 0 40 40" />
                  </span>
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {linkedinIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {githubIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.github')} arrow>
                  <GitHubIcon width="20px" height="20px" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {githubIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {emailIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.email')} arrow>
                  <EmailIcon width="20px" height="20px" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {emailIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
            {smsIp && (
              <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('admin:components.user.sms')} arrow>
                  <PhoneIcon width="20px" height="20px" />
                </Tooltip>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {smsIp.accountIdentifier!}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}

        {viewMode && (
          <AutoComplete data={scopeMenu} label={t('admin:components.user.grantScope')} value={state.scopes} disabled />
        )}

        {!viewMode && (
          <div>
            <AutoComplete
              data={scopeMenu}
              label={t('admin:components.user.grantScope')}
              value={state.scopes}
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
