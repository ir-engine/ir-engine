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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMagnifyingGlass } from 'react-icons/hi2'

import { userPath, UserType } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { useMutation } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { PopoverState } from '../../../common/services/PopoverState'
import UserTable, { removeUsers } from './UserTable'

export default function Users() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })
  const skipGuests = useHookstate(false)
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedUsers = useHookstate<UserType[]>([])

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  const adminUserRemove = useMutation(userPath).remove
  const modalProcessing = useHookstate(false)

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.user.users')}
        </Text>
        <div className="mb-4 flex justify-between">
          <Input
            placeholder={t('common:components.search')}
            value={search.local.value}
            onChange={(event) => {
              search.local.set(event.target.value)

              if (debouncedSearchQueryRef) {
                clearTimeout(debouncedSearchQueryRef.current)
              }

              debouncedSearchQueryRef.current = setTimeout(() => {
                search.query.set(event.target.value)
              }, 100)
            }}
            className="bg-theme-surface-main"
            containerClassName="w-1/5 block"
            startComponent={<HiMagnifyingGlass />}
          />
          {selectedUsers.length > 0 && (
            <Button
              variant="danger"
              size="small"
              onClick={() => {
                PopoverState.showPopupover(
                  <ConfirmDialog
                    text={t('admin:components.user.confirmMultiUserDelete')}
                    onSubmit={async () => {
                      removeUsers(modalProcessing, adminUserRemove, selectedUsers.value as UserType[])
                    }}
                  />
                )
              }}
            >
              {t('admin:components.user.removeUsers')}
            </Button>
          )}
        </div>
      </div>
      <UserTable skipGuests={skipGuests.value} search={search.query.value} selectedUsers={selectedUsers} />
    </>
  )
}
