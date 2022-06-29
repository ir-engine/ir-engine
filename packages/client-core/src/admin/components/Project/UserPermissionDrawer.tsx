import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectPermissionInterface } from '@xrengine/common/src/interfaces/ProjectPermissionInterface'

import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'

import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import InputText from '../../common/InputText'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  project: ProjectInterface
  onClose: () => void
}

const UserPermissionDrawer = ({ open, project, onClose }: Props) => {
  const { t } = useTranslation()
  const [userInviteCode, setUserInviteCode] = useState('')

  const selfUser = useAuthState().user
  const selfUserPermission =
    project?.project_permissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner' ||
    selfUser.userRole.value === 'admin'
      ? 'owner'
      : 'user'

  const handleCreatePermission = async () => {
    if (!userInviteCode) return

    try {
      await ProjectService.createPermission(userInviteCode, project.id)
      await ProjectService.fetchProjects()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
    setUserInviteCode('')
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
              label={t('admin:components.project.inviteCode')}
              value={userInviteCode}
              onChange={(e) => setUserInviteCode(e.target.value)}
              onKeyDown={handleSubmitOnEnter}
            />
            <Button onClick={handleCreatePermission} className={styles['btn-submit']} disabled={!userInviteCode}>
              {t('editor.projects.createProjectPermission')}
            </Button>
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
                  disabled={selfUserPermission !== 'owner' || selfUser.id.value === permission.userId}
                />
                {selfUserPermission === 'owner' && selfUser.id.value !== permission.userId && (
                  <IconButton aria-label="Remove Access" onClick={() => handleRemovePermission(permission.id)}>
                    <HighlightOffIcon />
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
