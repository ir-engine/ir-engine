import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectPermissionInterface } from '@xrengine/common/src/interfaces/ProjectPermissionInterface'

import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'

import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  onClose: any
  projectPermissions: ProjectPermissionInterface[]
  project: ProjectInterface
  removePermission: (id: string) => Promise<void>
  addPermission: (userId: string, projectId: string) => Promise<void>
  patchPermission: (id: string, role: string) => Promise<void>
}

export const EditPermissionsDialog = ({
  open,
  onClose,
  project,
  addPermission,
  patchPermission,
  removePermission
}: Props): any => {
  const { t } = useTranslation()

  const [error, setError] = useState('')
  const [userInviteCode, setUserInviteCode] = useState('')

  const onCreatePermission = async () => {
    if (!userInviteCode) return
    setError('')

    try {
      await addPermission(userInviteCode, project.id)
    } catch (err) {
      setError(err.message)
    }
    setUserInviteCode('')
  }

  const onRemovePermission = async (id: string) => {
    try {
      await removePermission(id)
    } catch (err) {
      setError(err.message)
    }
  }

  const onPatchPermission = async (permission: ProjectPermissionInterface) => {
    try {
      await patchPermission(permission.id, permission.type === 'owner' ? 'user' : 'owner')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmitOnEnter = async (event) => {
    if (event.key === 'Enter') await onCreatePermission()
  }

  const closeDialog = () => {
    setUserInviteCode('')
    onClose()
  }

  const selfUser = useAuthState().user
  const selfUserPermission =
    project.project_permissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner'
      ? 'owner'
      : 'user'

  return (
    <Dialog
      open={open}
      classes={{ paper: styles.createProjectDialog }}
      onClose={closeDialog}
      closeAfterTransition
      TransitionComponent={Fade}
      TransitionProps={{ in: open }}
    >
      <DialogTitle>{`${t('editor.projects.editProjectPermissions')}: ${project.name}`}</DialogTitle>
      <DialogContent>
        {selfUserPermission === 'owner' && (
          <FormControl>
            <TextField
              id="outlined-basic"
              variant="outlined"
              size="small"
              placeholder={t('editor.projects.userInviteCode')}
              InputProps={{
                classes: {
                  root: styles.inputContainer,
                  notchedOutline: styles.outline,
                  input: styles.input
                }
              }}
              value={userInviteCode}
              onChange={(e) => setUserInviteCode(e.target.value)}
              onKeyDown={handleSubmitOnEnter}
            />
            {error && error.length > 0 && <h2 className={styles.errorMessage}>{error}</h2>}
            <Button onClick={onCreatePermission} className={styles.btn} disabled={!userInviteCode}>
              {t('editor.projects.addUser')}
            </Button>
          </FormControl>
        )}
        {project.project_permissions && (
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
                  onChange={() => onPatchPermission(permission)}
                  checked={permission.type === 'owner'}
                  inputProps={{
                    'aria-labelledby': permission.id
                  }}
                  disabled={selfUserPermission !== 'owner' || selfUser.id.value === permission.userId}
                />
                {selfUserPermission === 'owner' && selfUser.id.value !== permission.userId && (
                  <IconButton aria-label="Remove Access" onClick={() => onRemovePermission(permission.id)}>
                    <HighlightOffIcon />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
