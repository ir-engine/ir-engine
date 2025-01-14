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
import { HiTrash } from 'react-icons/hi2'

import { useMutation } from '@ir-engine/common'
import { podsPath, ServerPodInfoType } from '@ir-engine/common/src/schema.type.module'
import { timeAgo } from '@ir-engine/common/src/utils/datetime-sql'
import { useHookstate } from '@ir-engine/hyperflux'
import { Button, Tooltip } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'

import { PopoverState } from '../../../common/services/PopoverState'
import { serverColumns, ServerRowType } from '../../common/constants/server'
import DataTable from '../../common/Table'
import { useServerInfoFind } from '../../services/ServerInfoQuery'
import ServerLogsModal from './ServerLogsModal'

const containerColor = {
  Running: 'bg-theme-tagLime',
  Terminated: 'bg-theme-tagGreen',
  Undefined: 'bg-theme-tagRed',
  Waiting: 'bg-theme-tagYellow'
}

function ServerStatus({ serverPodInfo }: { serverPodInfo: ServerPodInfoType }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-3">
      {serverPodInfo.status === 'Succeeded' && (
        <Badge className="rounded" variant="success" label={t('admin:components.server.serverStatus.succeeded')} />
      )}
      {serverPodInfo.status === 'Running' && (
        <Badge className="rounded" variant="successLight" label={t('admin:components.server.serverStatus.running')} />
      )}
      {serverPodInfo.status === 'Pending' && (
        <Badge className="rounded" variant="warning" label={t('admin:components.server.serverStatus.pending')} />
      )}
      {serverPodInfo.status === 'Failed' && (
        <Badge className="rounded" variant="danger" label={t('admin:components.server.serverStatus.failed')} />
      )}
      {serverPodInfo.status === 'Unknown' && (
        <Badge className="rounded" variant="neutral" label={t('admin:components.server.serverStatus.unknown')} />
      )}
      <div className="flex gap-1">
        {serverPodInfo.containers.map((container) => (
          <Tooltip key={container.name} content={`${t('admin:components.server.name')}: ${container.name}`}>
            <div className={`${containerColor[container.status]} h-3.5 w-3.5 rounded-full`} />
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

export default function ServerTable({
  serverType,
  serverInfoQuery
}: {
  serverType: string
  serverInfoQuery: ReturnType<typeof useServerInfoFind>
}) {
  const { t } = useTranslation()
  const podRemove = useMutation(podsPath).remove
  const modalProcessing = useHookstate(false)

  const createRows = (rows: readonly ServerPodInfoType[]): ServerRowType[] =>
    rows.map((row) => ({
      name: row.name,
      status: <ServerStatus serverPodInfo={row} />,
      type: row.type,
      currentUsers: row.currentUsers?.toString(),
      age: t('common:timeAgo', { time: timeAgo(new Date(row.age)) }),
      restarts: row.containers.map((container) => container.restarts).join(', '),
      instanceId: row.instanceId,
      action: (
        <div className="flex items-center gap-5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              PopoverState.showPopupover(
                <ServerLogsModal podName={row.name} containerName={row.containers?.at(-1)?.name} />
              )
            }}
          >
            {t('admin:components.server.viewLogs')}
          </Button>
          <Button
            variant="tertiary"
            className="h-8 w-8"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.server.confirmPodDelete')} ${row.name}?`}
                  onSubmit={async () => {
                    await podRemove(row.name)
                  }}
                />
              )
            }}
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }))

  return (
    <DataTable
      size="sm"
      query={serverInfoQuery}
      columns={serverColumns}
      rows={createRows(serverInfoQuery.data.find((serverInfo) => serverInfo.id === serverType)?.pods || [])}
    />
  )
}
