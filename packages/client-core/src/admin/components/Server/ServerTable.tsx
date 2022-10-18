import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ServerPodInfo } from '@xrengine/common/src/interfaces/ServerInfo'
import multiLogger from '@xrengine/common/src/logger'

import SyncIcon from '@mui/icons-material/Sync'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'

import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import TableComponent from '../../common/Table'
import { ServerColumn, ServerPodData } from '../../common/variables/server'
import { ServerInfoService, useServerInfoState } from '../../services/ServerInfoService'
import { ServerLogsService } from '../../services/ServerLogsService'
import styles from '../../styles/admin.module.scss'

const logger = multiLogger.child({ component: 'client-core:ServerTable' })

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')

interface Props {
  selectedCard: string
}

const ServerTable = ({ selectedCard }: Props) => {
  const { t } = useTranslation()
  const [autoRefresh, setAutoRefresh] = useState('0')
  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer>()
  const serverInfo = useServerInfoState()

  useEffect(() => {
    if (autoRefresh !== '0') {
      const interval = setInterval(() => {
        handleRefreshServerInfo()
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

  const createData = (el: ServerPodInfo): ServerPodData => {
    return {
      el,
      name: el.name,
      status: el.status,
      age: timeAgo.format(new Date(el.age)),
      restarts: el.containers.map((item) => item.restarts).join(', '),
      containers: (
        <>
          {el.containers.map((item) => (
            <div
              key={item.name}
              className={`${styles.containerCircle} ${
                item.status === 'Running'
                  ? styles.containerGreen
                  : item.status === 'Terminated'
                  ? styles.containerRed
                  : ''
              }`}
              title={`${t('admin:components.server.name')}: ${item.name}\n${t('admin:components.server.status')}: ${
                item.status
              }`}
            />
          ))}
        </>
      ),
      action: (
        <a href="#" className={styles.actionStyle} style={{ float: 'right' }} onClick={() => {}}>
          <span
            className={styles.spanDange}
            onClick={() => ServerLogsService.fetchServerLogs(el.name, el.containers[el.containers.length - 1].name)}
          >
            {t('admin:components.server.logs')}
          </span>
        </a>
      )
    }
  }

  const handleRefreshServerInfo = () => {
    logger.info('Refreshing server info.')
    ServerInfoService.fetchServerInfo()
  }

  const handleAutoRefreshServerInfoChange = (e) => {
    const { value } = e.target

    setAutoRefresh(value)
  }

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
      label: `60 ${t('admin:components.server.seconds')}`
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

  const serverInfoDataColumns: ServerColumn[] = [
    { id: 'name', label: t('admin:components.server.name'), minWidth: 65 },
    { id: 'status', label: t('admin:components.server.status'), minWidth: 65 },
    { id: 'restarts', label: t('admin:components.server.restarts'), minWidth: 65 },
    { id: 'containers', label: t('admin:components.server.containers'), minWidth: 65 },
    { id: 'age', label: t('admin:components.server.age'), minWidth: 65 },
    {
      id: 'action',
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {serverInfo.value.retrieving === false && (
            <IconButton
              title={t('admin:components.common.refresh')}
              className={styles.iconButton}
              sx={{ marginRight: 1.5 }}
              onClick={handleRefreshServerInfo}
            >
              <SyncIcon />
            </IconButton>
          )}

          {serverInfo.value.retrieving && <CircularProgress size={24} sx={{ marginRight: 1.5 }} />}

          <InputSelect
            name="autoRefresh"
            label={t('admin:components.server.autoRefresh')}
            value={autoRefresh}
            menu={autoRefreshMenu}
            sx={{ marginBottom: 0, flex: 1 }}
            onChange={handleAutoRefreshServerInfoChange}
          />
        </Box>
      ),
      minWidth: 65
    }
  ]

  const rows = serverInfo.value.servers
    .find((item) => item.id === selectedCard)!
    .pods.map((el) => {
      return createData(el)
    })

  return (
    <TableComponent
      allowSort={false}
      rows={rows}
      column={serverInfoDataColumns}
      page={0}
      count={rows.length}
      rowsPerPage={rows.length}
      handlePageChange={() => {}}
      handleRowsPerPageChange={() => {}}
    />
  )
}

export default ServerTable
