import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@xrengine/client-core/src/common/components/InputText'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectPermissionInterface } from '@xrengine/common/src/interfaces/ProjectPermissionInterface'
import Button from '@xrengine/ui/src/Button'
import Container from '@xrengine/ui/src/Container'
import DialogActions from '@xrengine/ui/src/DialogActions'
import DialogTitle from '@xrengine/ui/src/DialogTitle'
import Icon from '@xrengine/ui/src/Icon'
import IconButton from '@xrengine/ui/src/IconButton'
import List from '@xrengine/ui/src/List'
import ListItem from '@xrengine/ui/src/ListItem'
import ListItemText from '@xrengine/ui/src/ListItemText'
import Switch from '@xrengine/ui/src/Switch'

import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  project: ProjectInterface
  onClose: () => void
}

const UserPermissionDrawer = ({ open, project, onClose }: Props) => {
  const { t } = useTranslation()
  const [userInviteCode, setUserInviteCode] = useState('')
  const [error, setError] = useState('')

  const selfUser = useAuthState().user
  const selfUserPermission =
    project?.project_permissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner' ||
    selfUser.scopes?.value?.find((scope) => scope.type === 'admin:admin')
      ? 'owner'
      : 'user'

  const handleChange = (e) => {
    const { value } = e.target
    setError(value ? '' : t('admin:components.project.inviteCodeRequired'))
    setUserInviteCode(value)
  }

  const handleCreatePermission = async () => {
    if (!userInviteCode) {
      setError(t('admin:components.project.inviteCodeCantEmpty'))
      return
    }

    try {
      await ProjectService.createPermission(userInviteCode, project.id)
      await ProjectService.fetchProjects()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
    setUserInviteCode('')
    setError('')
  }

  const handleRemovePermission = async (id: string) => {
    try {
      await ProjectService.removePermission(id)
      await ProjectService.fetchProjects()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handlePatchPermission = async (permission: ProjectPermissionInterface) => {
    try {
      await ProjectService.patchPermission(permission.id, permission.type === 'owner' ? 'user' : 'owner')
      await ProjectService.fetchProjects()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleSubmitOnEnter = async (event) => {
    if (event.key === 'Enter') await handleCreatePermission()
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{`${project.name} ${t(
          'admin:components.project.userAccess'
        )}`}</DialogTitle>

        {selfUserPermission === 'owner' && (
          <>
            <InputText
              name="userInviteCode"
              label={t('admin:components.project.userInviteCode')}
              value={userInviteCode}
              error={error}
              onChange={handleChange}
              onKeyDown={handleSubmitOnEnter}
            />

            <DialogActions>
              <Button className={styles.outlinedButton} onClick={onClose}>
                {t('admin:components.common.cancel')}
              </Button>
              <Button className={styles.gradientButton} onClick={handleCreatePermission}>
                {t('editor.projects.addUser')}
              </Button>
            </DialogActions>
          </>
        )}

        {project && project.project_permissions && (
          <List dense={true}>
            {project.project_permissions.map((permission) => (
              <ListItem key={permission.id}>
                <ListItemText
                  id={permission.id}
                  primary={
                    permission.userId === selfUser.id.value ? `${permission.user?.name} (you)` : permission.user?.name
                  }
                  classes={{ secondary: styles.secondaryText }}
                  secondary={permission.type}
                />
                <Switch
                  edge="end"
                  onChange={() => handlePatchPermission(permission)}
                  checked={permission.type === 'owner'}
                  inputProps={{
                    'aria-labelledby': permission.id
                  }}
                  disabled={
                    selfUserPermission !== 'owner' ||
                    selfUser.id.value === permission.userId ||
                    project.project_permissions!.length === 1
                  }
                />
                {selfUserPermission === 'owner' && selfUser.id.value !== permission.userId && (
                  <IconButton
                    className={styles.iconButton}
                    aria-label="Remove Access"
                    onClick={() => handleRemovePermission(permission.id)}
                  >
                    <Icon type="HighlightOff" />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </DrawerView>
  )
}

export default UserPermissionDrawer
