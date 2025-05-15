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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useFind } from '@ir-engine/common'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import { Select } from '@ir-engine/ui'
import { OptionType } from '@ir-engine/ui/src/primitives/tailwind/Select'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UserSearchInput = ({ onSelect }) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const debouncedSetSearchTerm = debounce(setDebouncedSearchTerm, 500)

  useEffect(() => {
    debouncedSetSearchTerm(searchTerm)
    setSearchTerm(searchTerm)
  }, [searchTerm])

  const { data: users, status } = useFind(userPath, {
    query: {
      name: { $like: `%${debouncedSearchTerm}%` },
      $limit: 10
    }
  })

  const options: OptionType[] = users.map((user) => ({
    value: user.id,
    label: user.name
  }))

  const handleSelect = (value) => {
    const selectedUser = users.find((user) => user.id === value)
    onSelect(selectedUser)
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-400">{t('admin:components.moderation.username')}</label>
      <Select
        options={options}
        value={searchTerm}
        onInputChange={(value) => setSearchTerm(value)}
        onChange={handleSelect}
        searchMode="substring"
        width="full"
        inputHeight="l"
        helperText={t('admin:components.moderation.userBannedSelectUserHelperText')}
      />
    </div>
  )
}
