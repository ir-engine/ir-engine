import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import multiLogger from '@etherealengine/common/src/logger'
import Box from '@etherealengine/ui/src/Box'
import CircularProgress from '@etherealengine/ui/src/CircularProgress'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import { useServerInfoState } from '../../services/ServerInfoService'
import { ServerLogsService, useServerLogsState } from '../../services/ServerLogsService'
import styles from '../../styles/admin.module.scss'

const logger = multiLogger.child({ component: 'client-core:ServerLogs' })

const ServerLogs = () => {
  const { t } = useTranslation()
  const logsEndRef = useRef(null)
  const [autoRefresh, setAutoRefresh] = useState('60')
  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer>()
  const serverInfo = useServerInfoState()
  const serverLogs = useServerLogsState()

  const scrollLogsToBottom = () => {
    ;(logsEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom of logs
  useEffect(() => {
    scrollLogsToBottom()
  }, [serverLogs.logs.value])

  useEffect(() => {
    if (autoRefresh !== '0') {
      const interval = setInterval(() => {
        handleRefreshServerLogs()
      }, parseInt(autoRefresh) * 1000)
      setIntervalTimer(interval)
      return () => {
        if (interval) clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
      }
    } else if (intervalTimer) {
      clearInterval(intervalTimer)
      setIntervalTimer(undefined)
    }
  }, [autoRefresh])

  const handleRefreshServerLogs = () => {
    logger.info('Refreshing server logs.')
    ServerLogsService.fetchServerLogs(serverLogs.podName.value!, serverLogs.containerName.value!)
  }

  const handleAutoRefreshServerLogsChange = (e) => {
    const { value } = e.target

    setAutoRefresh(value)
  }

  const handleCloseServerLogs = () => {
    ServerLogsService.resetServerLogs()
  }

  const handleDownloadServerLogs = () => {
    const blob = new Blob([serverLogs.value.logs], { type: 'text/plain;charset=utf-8' })
    window.open(URL.createObjectURL(blob), `${serverLogs.value.logs}.log.txt`)
  }

  const handleContainerServerLogsChange = (e) => {
    const { value } = e.target

    ServerLogsService.fetchServerLogs(serverLogs.podName.value!, value)
  }

  const containers = serverInfo.servers.value
    .find((item) => item.id === 'all')
    ?.pods.find((item) => item.name === serverLogs.podName.value!)
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

  if (!serverLogs.value.fetched) {
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
          {t('admin:components.server.logs')}: {serverLogs.podName.value!}
        </h5>

        <InputSelect
          name="autoRefresh"
          label={t('admin:components.server.container')}
          value={serverLogs.containerName.value!}
          menu={containersMenu!}
          sx={{ marginBottom: 0, width: '200px', marginRight: 1.5, marginLeft: 3 }}
          onChange={handleContainerServerLogsChange}
        />

        <div style={{ flex: 1 }}></div>

        <IconButton
          title={t('admin:components.server.download')}
          className={styles.iconButton}
          onClick={handleDownloadServerLogs}
          icon={<Icon type="Download" />}
        />

        {serverLogs.value.retrieving === false && (
          <IconButton
            title={t('admin:components.common.refresh')}
            className={styles.iconButton}
            sx={{ marginRight: 1.5 }}
            onClick={handleRefreshServerLogs}
            icon={<Icon type="Sync" />}
          />
        )}

        {serverLogs.value.retrieving && <CircularProgress size={24} sx={{ marginRight: 1.5 }} />}

        <InputSelect
          name="autoRefresh"
          label={t('admin:components.server.autoRefresh')}
          value={autoRefresh}
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
        <pre style={{ fontSize: '14px' }}>{serverLogs.value.logs}</pre>
        <pre ref={logsEndRef} />
      </Box>
    </Box>
  )
}

export default ServerLogs
