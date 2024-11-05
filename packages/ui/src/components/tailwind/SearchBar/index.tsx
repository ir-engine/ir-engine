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

import { State } from '@ir-engine/hyperflux'

import { SearchSmSm } from '@ir-engine/ui/src/icons'
import Input, { InputProps } from '@ir-engine/ui/src/primitives/tailwind/Input'

export default function SearchBar({
  search,
  variantSize = 'l',
  inputProps = {},
  debounceTime = 100
}: {
  search: State<{
    local: string
    query: string
  }>
  variantSize?: InputProps['variantSize']
  inputProps?: Partial<InputProps>
  debounceTime?: number
}) {
  const { t } = useTranslation()
  const debouncedSearchQueryRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => clearTimeout(debouncedSearchQueryRef.current), [])

  return (
    <Input
      placeholder={t('common:components.search')}
      value={search?.value.local ?? ''}
      onChange={(event) => {
        search.local.set(event.target.value)

        if (debouncedSearchQueryRef) {
          clearTimeout(debouncedSearchQueryRef.current)
        }

        debouncedSearchQueryRef.current = setTimeout(() => {
          search.query.set(event.target.value)
        }, debounceTime)
      }}
      startComponent={<SearchSmSm className="h-20 text-white" />}
      data-testid="search-input"
      variantSize={variantSize}
      {...inputProps}
    />
  )
}
