/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveCircleOutline } from 'react-icons/md'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@ir-engine/client-core/src/common/services/ProjectService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useFind } from '@ir-engine/common'
import {
  InviteCode,
  ProjectPermissionType,
  ProjectType,
  ScopeType,
  projectPermissionPath,
  scopePath
} from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { ImmutableObject, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'

export default function ManageUserPermissionModal({ project }: { project: ImmutableObject<ProjectType> }) {
  const { t } = useTranslation()
  const selfUser = useHookstate(getMutableState(AuthState)).user
  const userInviteCode = useHookstate('' as InviteCode)
  const userInviteCodeError = useHookstate(undefined)

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.store.userID,
      type: 'admin:admin' as ScopeType
    }
  })

  const userHasAccess = scopeQuery.data.length > 0

  const selfUserPermission =
    project?.projectPermissions?.find((permission) => permission.userId === selfUser.id.value)?.type === 'owner' ||
    userHasAccess
      ? 'owner'
      : 'user'

  const projectPermissionsFindQuery = useFind(projectPermissionPath, {
    query: {
      projectId: project.id,
      paginate: false
    }
  })

  const handleCreatePermission = async () => {
    if (!userInviteCode.value) {
      userInviteCodeError.set(t('admin:components.project.inviteCodeCantEmpty'))
      return
    }
    try {
      await ProjectService.createPermission(userInviteCode.value, project.id, 'reviewer')
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handlePatchPermission = async (permission: ProjectPermissionType) => {
    try {
      await ProjectService.patchPermission(permission.id, permission.type === 'owner' ? 'user' : 'owner')
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const handleRemovePermission = async (id: string) => {
    try {
      await ProjectService.removePermission(id)
      projectPermissionsFindQuery.refetch()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  return (
    <Modal
      title={t('admin:components.project.userAccess')}
      className="w-[50vw] max-w-2xl"
      onSubmit={() => {
        handleCreatePermission()
      }}
      hideFooter={selfUserPermission !== 'owner'}
      onClose={() => PopoverState.hidePopupover()}
    >
      {selfUserPermission === 'owner' && (
        <Input
          label={t('admin:components.project.userInviteCode')}
          value={userInviteCode.value}
          onChange={(event) => userInviteCode.set(event.target.value as InviteCode)}
          error={userInviteCodeError.value}
        />
      )}
      <div className="grid gap-4">
        {projectPermissionsFindQuery.data.map((permission) => (
          <div key={permission.id} className="flex items-center gap-2">
            <Text fontSize="sm">
              {permission.userId === selfUser.id.value ? `${permission.user?.name} (you)` : permission.user?.name}
            </Text>
            <Text fontSize="sm" theme="secondary">
              {permission.type}
            </Text>
            <Toggle
              value={permission.type === 'owner'}
              onChange={() => handlePatchPermission(permission)}
              disabled={
                selfUserPermission !== 'owner' ||
                selfUser.id.value === permission.userId ||
                projectPermissionsFindQuery.data.length === 1
              }
            />
            <Button
              startIcon={<MdOutlineRemoveCircleOutline />}
              title="Remove Access"
              onClick={() => handleRemovePermission(permission.id)}
            />
          </div>
        ))}
      </div>
    </Modal>
  )
}
