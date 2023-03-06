import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import config from '@etherealengine/common/src/config'
import { ServerPodInfo } from '@etherealengine/common/src/interfaces/ServerInfo'
import multiLogger from '@etherealengine/common/src/logger'
import Box from '@etherealengine/ui/src/Box'
import CircularProgress from '@etherealengine/ui/src/CircularProgress'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

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
  const [openConfirm, setOpenConfirm] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState('60')
  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer>()
  const [selectedPod, setSelectedPod] = useState<ServerPodInfo | null>(null)
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
      type: el.type || '',
      currentUsers: el.currentUsers?.toString() || '',
      age: timeAgo.format(new Date(el.age)),
      restarts: el.containers.map((item) => item.restarts).join(', '),
      instanceId: el.instanceId ? (
        <a
          href="#"
          className={styles.actionStyle}
          onClick={() =>
            window.open(
              `${window.location.protocol}//${window.location.host}/location/${el.locationSlug}?instanceId=${el.instanceId}`,
              '_blank'
            )
          }
        >
          <span className={styles.spanDange}>{el.instanceId}</span>
        </a>
      ) : (
        <span />
      ),
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
        <div style={{ float: 'right' }}>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => ServerLogsService.fetchServerLogs(el.name, el.containers[el.containers.length - 1].name)}
          >
            <span className={styles.spanWhite}>{t('admin:components.server.logs')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setSelectedPod(el)
              setOpenConfirm(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </div>
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

  const handleRemovePod = async () => {
    if (!selectedPod) {
      return
    }

    await ServerInfoService.removePod(selectedPod.name)
    setOpenConfirm(false)
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

  const serverInfoDataColumns: ServerColumn[] = [
    { id: 'name', label: t('admin:components.server.name'), minWidth: 65 },
    { id: 'status', label: t('admin:components.server.status'), minWidth: 65 },
    { id: 'type', label: t('admin:components.server.type'), minWidth: 65 },
    { id: 'currentUsers', label: t('admin:components.server.users'), minWidth: 65 },
    { id: 'restarts', label: t('admin:components.server.restarts'), minWidth: 65 },
    { id: 'containers', label: t('admin:components.server.containers'), minWidth: 65 },
    { id: 'age', label: t('admin:components.server.age'), minWidth: 65 },
    { id: 'instanceId', label: t('admin:components.server.instance'), minWidth: 65 },
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
              icon={<Icon type="Sync" />}
            />
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
    <>
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

      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.server.confirmPodDelete')} '${selectedPod?.name}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={handleRemovePod}
      />
    </>
  )
}

export default ServerTable
