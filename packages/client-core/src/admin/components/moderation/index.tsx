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

import { useHookstate } from '@hookstate/core'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModerationBanContainer } from './ModerationBanContainer'
import ModerationTable from './ModerationTable'

export default function Moderation() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })

  return (
    <>
      <Tabs
        tabsData={[
          {
            title: t('admin:components.moderation.header'),
            tabLabel: t('admin:components.moderation.header'),
            bottomComponent: (
              <div className="flex flex-col gap-5">
                <ModerationTable search={search.local.value} />
              </div>
            ),
            topComponent: <SearchBar search={search} debounceTime={1000} />
          },
          {
            title: t('admin:components.moderation.bannedUsers'),
            tabLabel: t('admin:components.moderation.bannedUsers'),
            bottomComponent: (
              <div className="flex flex-col gap-5">
                <ModerationBanContainer search={search.local.value} />
              </div>
            ),
            topComponent: <SearchBar search={search} debounceTime={1000} />
          }
        ]}
        onTabChange={() => search.set({ local: '', query: '' })}
      />
    </>
  )
}
