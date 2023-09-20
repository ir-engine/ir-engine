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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { State, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { useGet } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { podsPath } from '@etherealengine/engine/src/schemas/cluster/pods.schema'
import { useServerInfoFind } from '../../services/ServerInfoQuery'
import styles from '../../styles/admin.module.scss'

export type ServerLogsInputsType = { podName?: string; containerName?: string }

const ServerLogs = ({
  podName,
  containerName
}: {
  podName: State<ServerLogsInputsType['podName']>
  containerName: State<ServerLogsInputsType['containerName']>
}) => {
  const { t } = useTranslation()
  const logsEndRef = useRef(null)
  const autoRefresh = useHookstate('60')
  const intervalTimer = useHookstate<NodeJS.Timer | undefined>(undefined)

  const serverInfo = useServerInfoFind().data
  const serverLogsQuery = useGet(podsPath, `${podName.value}/${containerName.value}`)
  const serverLogs = serverLogsQuery.data as string

  const scrollLogsToBottom = () => {
    ;(logsEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollLogsToBottom()
  }, [serverLogs])

  useEffect(() => {
    if (autoRefresh.value !== '0') {
      const interval = setInterval(
        () => {
          handleRefreshServerLogs()
        },
        parseInt(autoRefresh.value) * 1000
      )
      intervalTimer.set(interval)
      return () => {
        if (interval) clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
      }
    } else if (intervalTimer.value) {
      clearInterval(intervalTimer.value)
      intervalTimer.set(undefined)
    }
  }, [autoRefresh.value])

  const handleRefreshServerLogs = () => {
    serverLogsQuery.refetch()
  }

  const handleAutoRefreshServerLogsChange = (e) => {
    autoRefresh.set(e.target.value)
  }

  const handleCloseServerLogs = () => {
    podName.set(undefined)
    containerName.set(undefined)
  }

  const handleDownloadServerLogs = () => {
    const blob = new Blob([serverLogs], { type: 'text/plain;charset=utf-8' })
    window.open(URL.createObjectURL(blob), `${serverLogs}.log.txt`)
  }

  const containers = serverInfo.find((item) => item.id === 'all')?.pods.find((item) => item.name === podName.value!)
  const containersMenu = containers?.containers.map((item) => {
    return {
      value: item.name,
      label: item.name
    } as InputMenuItem
  })

  const autoRefreshMenu: InputMenuItem[] = [
    {
      value: '0',
      label: t('admin:components.server.none')
    },
    {
      value: '10',
      label: `10 ${t('admin:components.server.seconds')}`
    },
    {
      value: '30',
      label: `30 ${t('admin:components.server.seconds')}`
    },
    {
      value: '60',
      label: `1 ${t('admin:components.server.minute')}`
    },
    {
      value: '300',
      label: `5 ${t('admin:components.server.minutes')}`
    },
    {
      value: '600',
      label: `10 ${t('admin:components.server.minutes')}`
    }
  ]

  if (typeof serverLogs !== 'string') {
    return (
      <LoadingView
        title={t('admin:components.server.loadingLogs')}
        variant="body2"
        sx={{ position: 'absolute', top: 0 }}
      />
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
        <h5 style={{ fontSize: '18px' }}>
          {t('admin:components.server.logs')}: {podName.value!}
        </h5>

        <InputSelect
          name="autoRefresh"
          label={t('admin:components.server.container')}
          value={containerName.value}
          menu={containersMenu!}
          sx={{ marginBottom: 0, width: '200px', marginRight: 1.5, marginLeft: 3 }}
          onChange={(event) => containerName.set(event.target.value)}
        />

        <div style={{ flex: 1 }}></div>

        <IconButton
          title={t('admin:components.server.download')}
          className={styles.iconButton}
          onClick={handleDownloadServerLogs}
          icon={<Icon type="Download" />}
        />

        {!serverLogs && (
          <IconButton
            title={t('admin:components.common.refresh')}
            className={styles.iconButton}
            sx={{ marginRight: 1.5 }}
            onClick={handleRefreshServerLogs}
            icon={<Icon type="Sync" />}
          />
        )}

        {serverLogs && <CircularProgress size={24} sx={{ marginRight: 1.5 }} />}

        <InputSelect
          name="autoRefresh"
          label={t('admin:components.server.autoRefresh')}
          value={autoRefresh.value}
          menu={autoRefreshMenu}
          sx={{ marginBottom: 0, width: '160px', marginRight: 1.5 }}
          onChange={handleAutoRefreshServerLogsChange}
        />

        <IconButton
          title={t('admin:components.common.close')}
          className={styles.iconButton}
          onClick={handleCloseServerLogs}
          icon={<Icon type="Close" />}
        />
      </Box>
      <Box sx={{ overflow: 'auto' }}>
        <pre style={{ fontSize: '14px' }}>{serverLogs}</pre>
        <pre ref={logsEndRef} />
      </Box>
    </Box>
  )
}

export default ServerLogs
