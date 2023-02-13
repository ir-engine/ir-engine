import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import LoadingView from '@xrengine/client-core/src/common/components/LoadingView'

import { Box } from '@mui/material'
import Grid from '@mui/material/Grid'

import { ServerInfoService, useServerInfoState } from '../../services/ServerInfoService'
import styles from '../../styles/admin.module.scss'
import ServerTable from './ServerTable'

import 'react-reflex/styles.css'

import AdminSystem from '@xrengine/client-core/src/systems/AdminSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { dispatchAction } from '@xrengine/hyperflux'

import { useServerLogsState } from '../../services/ServerLogsService'
import ServerList from './ServerList'
import ServerLogs from './ServerLogs'

const Server = () => {
  const [refetch, setRefetch] = useState(false)

  const { t } = useTranslation()
  const [selectedCard, setSelectedCard] = useState('all')
  const serverInfo = useServerInfoState()
  const serverLogs = useServerLogsState()

  let displayLogs = serverLogs.podName.value ? true : false

  useEffect(() => {
    if (serverInfo.updateNeeded.value) ServerInfoService.fetchServerInfo()
  }, [serverInfo.updateNeeded.value, refetch])

  if (!serverInfo.value.fetched) {
    return (
      <LoadingView title={t('admin:components.server.loading')} variant="body2" sx={{ position: 'absolute', top: 0 }} />
    )
  }

  return (
    <Box sx={{ height: 'calc(100% - 106px)' }}>
      <Grid container spacing={1} className={styles.mb10px}>
        <ServerList data={serverInfo?.value?.servers} selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
      </Grid>
      {displayLogs === false && <ServerTable selectedCard={selectedCard} />}
      {displayLogs && (
        <ReflexContainer orientation="horizontal">
          <ReflexElement flex={0.45} style={{ display: 'flex', flexDirection: 'column' }}>
            <ServerTable selectedCard={selectedCard} />
          </ReflexElement>

          <ReflexSplitter />

          <ReflexElement flex={0.55} style={{ overflow: 'hidden' }}>
            <ServerLogs />
          </ReflexElement>
        </ReflexContainer>
      )}
    </Box>
  )
}

Server.displayName = 'Server'

Server.defaultProps = {}

export default Server
