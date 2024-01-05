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

import { useHookstate } from '@hookstate/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { getMutableState } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import List from '@etherealengine/ui/src/primitives/mui/List'
import ListItem from '@etherealengine/ui/src/primitives/mui/ListItem'
import ListItemText from '@etherealengine/ui/src/primitives/mui/ListItemText'
import Switch from '@etherealengine/ui/src/primitives/mui/Switch'

import { InviteCode, ProjectPermissionType, ProjectType } from '@etherealengine/common/src/schema.type.module'
import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import { AuthState } from '../../../user/services/AuthService'
import { userHasAccess } from '../../../user/userHasAccess'
import DrawerView from '../../common/DrawerView'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  project: ProjectType
  onClose: () => void
}

const UserPermissionDrawer = ({ open, project, onClose }: Props) => {
  const { t } = useTranslation()
  const [userInviteCode, setUserInviteCode] = useState('' as InviteCode)
  const [error, setError] = useState('')
  const selfUser = useHookstate(getMutableState(AuthState)).user
  const selfUserPermission =
    project?.projectPermissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner' ||
    userHasAccess('admin:admin')
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
    setUserInviteCode('' as InviteCode)
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

  const handlePatchPermission = async (permission: ProjectPermissionType) => {
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

        {project && project.projectPermissions && (
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
                  onChange={() => handlePatchPermission(permission)}
                  checked={permission.type === 'owner'}
                  inputProps={{
                    'aria-labelledby': permission.id
                  }}
                  disabled={
                    selfUserPermission !== 'owner' ||
                    selfUser.id.value === permission.userId ||
                    project.projectPermissions!.length === 1
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
