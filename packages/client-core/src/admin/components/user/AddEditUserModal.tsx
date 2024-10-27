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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useFind, useMutation } from '@ir-engine/common'
import {
  ScopeType,
  UserType,
  avatarPath,
  identityProviderPath,
  scopePath,
  scopeTypePath,
  userAvatarPath
} from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Label from '@ir-engine/ui/src/primitives/tailwind/Label'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import MultiSelect from '@ir-engine/ui/src/primitives/tailwind/MultiSelect'
import Select, { SelectOptionsType } from '@ir-engine/ui/src/primitives/tailwind/Select'

import AccountIdentifiers from './AccountIdentifiers'

const getDefaultErrors = () => ({
  name: '',
  avatarId: '',
  serviceError: ''
})

export default function AddEditUserModal({ user }: { user?: UserType }) {
  const { t } = useTranslation()

  const scopeMutation = useMutation(scopePath)
  const avatarsQuery = useFind(avatarPath, {
    query: {
      action: 'admin'
    }
  })
  const userScopesQuery = useFind(scopePath, {
    query: {
      userId: user?.id,
      paginate: false
    }
  })
  const userAvatarQuery = useFind(userAvatarPath, {
    query: {
      userId: user?.id
    }
  })
  const userAvatar = userAvatarQuery.status === 'success' ? userAvatarQuery.data[0] : null
  const avatarOptions: SelectOptionsType[] =
    avatarsQuery.status === 'success'
      ? [
          { label: t('admin:components.user.selectAvatar'), value: '', disabled: true },
          ...avatarsQuery.data.map((av) => ({ label: av.name, value: av.id }))
        ]
      : [{ label: t('common:select.fetching'), value: '', disabled: true }]

  const scopeTypesQuery = useFind(scopeTypePath, {
    query: {
      paginate: false
    }
  })
  const scopeTypeOptions: SelectOptionsType[] =
    scopeTypesQuery.status === 'success'
      ? [
          { label: t('admin:components.user.selectScopes'), value: '', disabled: true },
          ...scopeTypesQuery.data.map((st) => ({ label: st.type, value: st.type }))
        ]
      : [{ label: t('common:select.fetching'), value: '', disabled: true }]

  if (user && userScopesQuery.status === 'success') {
    for (const scope of userScopesQuery.data) {
      const scopeExists = scopeTypeOptions.find((st) => st.value === scope.type)
      if (!scopeExists) {
        scopeTypeOptions.push({ label: scope.type, value: scope.type })
      }
    }

    if (!avatarOptions.find((av) => av.value === userAvatar?.avatarId) && userAvatar?.avatarId) {
      avatarOptions.push({ label: userAvatar.avatar.name || userAvatar.avatarId, value: userAvatar.avatarId })
    }
  }

  const identityProvidersQuery = useFind(identityProviderPath, { query: { userId: user?.id } })

  const submitLoading = useHookstate(false)
  const errors = useHookstate(getDefaultErrors())

  const name = useHookstate(user?.name || '')
  const avatarId = useHookstate(userAvatar?.avatarId || '')
  const scopes = useHookstate<Array<{ type: ScopeType }>>([])

  useEffect(() => {
    scopes.set(userScopesQuery.data.map((scope) => ({ type: scope.type })))
  }, [userScopesQuery.data, user])

  const handleSubmit = async () => {
    if (!user?.id) return

    errors.set(getDefaultErrors())

    if (!name.value) {
      errors.name.set(t('admin:components.user.nameCantEmpty'))
    }
    if (!avatarId.value) {
      errors.avatarId.set(t('admin:components.user.avatarCantEmpty'))
    }
    if (Object.values(errors.value).some((value) => value.length > 0)) {
      return
    }

    submitLoading.set(true)
    try {
      const scopesToCreate = scopes.value
        .filter((scope) => !userScopesQuery.data.find((current) => current.type === scope.type))
        .map((scope) => ({ type: scope.type, userId: user.id }))
      if (scopesToCreate.length > 0) {
        await scopeMutation.create(scopesToCreate)
      }
      const scopesToRemove = userScopesQuery.data
        .filter((current) => !scopes.value.find((scope) => scope.type === current.type))
        .map((scope) => scope.id)
      if (scopesToRemove.length > 0) {
        await scopeMutation.remove(null, {
          query: {
            id: {
              $in: scopesToRemove
            }
          }
        })
      }
      PopoverState.hidePopupover()
    } catch (error) {
      errors.serviceError.set(error.message)
    }

    submitLoading.set(false)
  }

  useEffect(() => {
    if (userAvatar) avatarId.set(userAvatar.avatarId)
  }, [userAvatar])

  return (
    <Modal
      title={user?.id ? t('admin:components.user.updateUser') : t('admin:components.user.addUser')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={submitLoading.value}
    >
      <div className="relative grid w-full gap-6">
        {errors.serviceError.value ? <p className="mt-2 text-red-700">{errors.serviceError.value}</p> : null}
        <Input
          label={t('admin:components.user.name')}
          placeholder={t('admin:components.user.namePlaceholder')}
          value={name.value}
          onChange={(event) => name.set(event.target.value)}
          error={errors.name.value}
        />
        <div className="grid gap-3">
          <MultiSelect
            label={t('admin:components.user.selectScopes')}
            options={scopeTypeOptions}
            selectedOptions={scopes.value.map((sc) => sc.type)}
            onChange={(values) => scopes.set((values as any).toSorted().map((v) => ({ type: v })))}
            menuClassName="max-h-72"
          />
          <div className="flex gap-2">
            <Button size="small" variant="outline" onClick={() => scopes.set([])}>
              {t('admin:components.user.clearAllScopes')}
            </Button>
            <Button
              size="small"
              className="bg-theme-blue-secondary text-blue-700 dark:text-white"
              onClick={() =>
                scopes.set(scopeTypeOptions.filter((st) => !st.disabled).map((st) => ({ type: st.value as ScopeType })))
              }
            >
              {t('admin:components.user.selectAllScopes')}
            </Button>
          </div>
        </div>
        <Select
          label={t('admin:components.user.avatar')}
          currentValue={avatarId.value}
          onChange={(value) => avatarId.set(value)}
          options={avatarOptions}
          error={errors.avatarId.value}
          menuClassname="min-h-52"
        />
        {user?.inviteCode && (
          <Input disabled label={t('admin:components.user.inviteCode')} onChange={() => {}} value={user.inviteCode} />
        )}
        {user?.id && identityProvidersQuery.data.filter((ip) => ip.type !== 'guest').length > 0 ? (
          <div className="grid gap-2">
            <Label>{t('admin:components.user.linkedAccounts')}</Label>
            <AccountIdentifiers user={user} />
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
