import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { ProjectInterface } from '@etherealengine/common/src/interfaces/ProjectInterface'
import { ProjectPermissionInterface } from '@etherealengine/common/src/interfaces/ProjectPermissionInterface'
import Button from '@etherealengine/ui/src/Button'
import Container from '@etherealengine/ui/src/Container'
import DialogActions from '@etherealengine/ui/src/DialogActions'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import List from '@etherealengine/ui/src/List'
import ListItem from '@etherealengine/ui/src/ListItem'
import ListItemText from '@etherealengine/ui/src/ListItemText'
import Switch from '@etherealengine/ui/src/Switch'

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
                    title="Remove Access"
                    onClick={() => handleRemovePermission(permission.id)}
                    icon={<Icon type="HighlightOff" />}
                  />
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
