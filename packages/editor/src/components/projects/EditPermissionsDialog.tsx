/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Switch from '@mui/material/Switch'

import { ProjectPermissionType } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import { ProjectType } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  onClose: any
  projectPermissions: ProjectPermissionType[]
  project: ProjectType
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

  const onPatchPermission = async (permission: ProjectPermissionType) => {
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

  const selfUser = useHookstate(getMutableState(AuthState)).user
  const selfUserPermission =
    project.projectPermissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner'
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
        {project.projectPermissions && (
          <List dense={true}>
            {project.projectPermissions.map((permission) => (
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
