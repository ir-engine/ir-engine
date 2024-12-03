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
import { GoDownload } from 'react-icons/go'
import { HiOutlineRefresh } from 'react-icons/hi'

import { useGet } from '@ir-engine/common'
import { podsPath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate } from '@ir-engine/hyperflux'
import { Select } from '@ir-engine/ui'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { PopoverState } from '../../../common/services/PopoverState'
import { serverAutoRefreshOptions } from '../../common/constants/server'
import { useServerInfoFind } from '../../services/ServerInfoQuery'

export default function ServerLogsModal({ podName, containerName }: { podName: string; containerName?: string }) {
  const logsEndRef = useRef<HTMLPreElement>(null)
  const { t } = useTranslation()

  const selectedContainerName = useHookstate(containerName)
  const serverLogsQuery = useGet(podsPath, `${podName}/${selectedContainerName.value}`)
  const serverLogs = serverLogsQuery.data

  const serverInfo = useServerInfoFind().data
  const containersOptions =
    serverInfo
      .find((info) => info.id === 'all')
      ?.pods.find((pod) => pod.name === podName)
      ?.containers.map((container) => ({ label: container.name, value: container.name })) || []

  useEffect(() => {
    if (serverLogs) {
      logsEndRef.current?.scrollIntoView()
    }
  }, [serverLogs])

  const handleDownloadServerLogs = () => {
    if (!serverLogs) return
    const blob = new Blob([serverLogs], { type: 'text/plain;charset=utf-8' })
    window.open(URL.createObjectURL(blob), `${serverLogs}.log.txt`)
  }

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRefresh = useHookstate('60')

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const refreshValue = parseInt(autoRefresh.value, 10)
    if (!refreshValue) return
    intervalRef.current = setInterval(serverLogsQuery.refetch, refreshValue * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh])

  return (
    <Modal
      className="w-[50vw] max-w-[50vw]"
      title={t('admin:components.server.serverLogs')}
      onClose={() => PopoverState.hidePopupover()}
    >
      <div className="space-y-4">
        <div className="space-between mb-2 flex w-full items-center">
          <Text fontSize="xl" component="h2">
            {t('admin:components.server.logs')}: {podName}
          </Text>
          <Button
            startIcon={<GoDownload />}
            title={t('admin:components.server.downloadLogs')}
            variant="outline"
            className="ml-auto border-0"
            onClick={handleDownloadServerLogs}
          />
        </div>
        <div className="flex items-end">
          <Select
            labelProps={{
              text: t('admin:components.server.container'),
              position: 'top'
            }}
            options={containersOptions}
            value={selectedContainerName.value || ''}
            onChange={(value: string) => selectedContainerName.set(value)}
          />
          <div className="ml-auto flex items-center">
            <Button
              title={t('admin:components.common.refresh')}
              onClick={() => serverLogsQuery.refetch()}
              startIcon={<HiOutlineRefresh />}
              variant="outline"
              className="border-0"
            />
            <Select
              options={serverAutoRefreshOptions}
              value={autoRefresh.value}
              onChange={(value: string) => autoRefresh.set(value)}
            />
          </div>
        </div>
        <div className="max-h-[50vh] overflow-auto">
          <pre className="bg-stone-300 text-sm font-[var(--lato)] dark:bg-stone-800">{serverLogs}</pre>
          <pre ref={logsEndRef} />
        </div>
      </div>
    </Modal>
  )
}
