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

import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'

import { HiOutlineRefresh } from 'react-icons/hi'

import { useHookstate } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { serverAutoRefreshOptions } from '../../common/constants/server'
import { useServerInfoFind } from '../../services/ServerInfoQuery'
import ApiJobsTable from './ApiJobsTable'
import MigrationsTable from './MigrationsTable'
import ServerTable from './ServerTable'

export default function Servers() {
  const { t } = useTranslation()
  const serverType = useHookstate('all')
  const serverInfoQuery = useServerInfoFind()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRefresh = useHookstate('60')

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const refreshValue = parseInt(autoRefresh.value, 10)
    if (!refreshValue) return
    intervalRef.current = setInterval(serverInfoQuery.refetch, refreshValue * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh])

  const ServersTopBar = () => {
    return (
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Text theme="secondary" fontSize="sm">
            {t('admin:components.server.autoRefresh')}
          </Text>
          <div className="flex items-center gap-1">
            <Button
              title={t('admin:components.common.refresh')}
              onClick={serverInfoQuery.refetch}
              startIcon={<HiOutlineRefresh />}
              variant="outline"
              className="justify-self-end border-0"
            />
            <Select
              options={serverAutoRefreshOptions}
              value={autoRefresh.value}
              onChange={(value: string) => autoRefresh.set(value)}
            />
          </div>
        </div>
      </div>
    )
  }

  const ServerTypeTiles = () => {
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {serverInfoQuery.data.map((info) => (
          <div
            key={info.id}
            className={`flex h-16 w-44 cursor-pointer items-start justify-between rounded-2xl bg-theme-surface-main p-4 ${
              serverType.value === info.id && 'border-b-2 border-b-blue-primary'
            }`}
            onClick={() => serverType.set(info.id)}
          >
            <Text fontSize="sm">{info.label}</Text>
            <Badge
              className="h-6 rounded-[90px] bg-blue-primary text-white"
              label={`${info.pods.filter((inf) => inf.status === 'Running').length}/${info.pods.length}`}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Tabs
        tabsData={[
          {
            title: t('admin:components.server.servers'),
            tabLabel: t('admin:components.server.servers'),
            rightComponent: <ServersTopBar />,
            bottomComponent: (
              <>
                <ServerTypeTiles />
                <ServerTable serverType={serverType.value} serverInfoQuery={serverInfoQuery} />
              </>
            )
          },
          {
            title: t('admin:components.server.migrations'),
            tabLabel: t('admin:components.server.migrations'),
            bottomComponent: <MigrationsTable />
          },
          {
            title: t('admin:components.server.apiJobs'),
            tabLabel: t('admin:components.server.apiJobs'),
            bottomComponent: <ApiJobsTable />
          }
        ]}
        tabcontainerClassName="bg-theme-primary"
      />
    </>
  )
}
