import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import { ServerInfoInterface } from '@etherealengine/common/src/interfaces/ServerInfo'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Card from '@etherealengine/ui/src/Card'
import CardActionArea from '@etherealengine/ui/src/CardActionArea'
import CardContent from '@etherealengine/ui/src/CardContent'
import Grid from '@etherealengine/ui/src/Grid'
import Typography from '@etherealengine/ui/src/Typography'

import { AdminServerInfoState, ServerInfoService } from '../../services/ServerInfoService'
import styles from '../../styles/admin.module.scss'
import ServerTable from './ServerTable'

import 'react-reflex/styles.css'

import { AdminServerLogsState } from '../../services/ServerLogsService'
import ServerLogs from './ServerLogs'

const Server = () => {
  const { t } = useTranslation()
  const selectedCard = useHookstate('all')
  const serverInfo = useHookstate(getMutableState(AdminServerInfoState))
  const serverLogs = useHookstate(getMutableState(AdminServerLogsState))

  let displayLogs = serverLogs.podName.value ? true : false

  useEffect(() => {
    if (serverInfo.updateNeeded.value) ServerInfoService.fetchServerInfo()
  }, [serverInfo.updateNeeded.value])

  if (!serverInfo.value.fetched) {
    return (
      <LoadingView title={t('admin:components.server.loading')} variant="body2" sx={{ position: 'absolute', top: 0 }} />
    )
  }

  return (
    <Box sx={{ height: 'calc(100% - 106px)' }}>
      <Grid container spacing={1} className={styles.mb10px}>
        {serverInfo.servers.get({ noproxy: true }).map((item, index) => (
          <Grid item key={item.id} xs={12} sm={6} md={2}>
            <ServerItemCard
              key={index}
              data={item}
              isSelected={selectedCard.value === item.id}
              onCardClick={selectedCard.set}
            />
          </Grid>
        ))}
      </Grid>
      {!displayLogs && <ServerTable selectedCard={selectedCard.value} />}
      {displayLogs && (
        <ReflexContainer orientation="horizontal">
          <ReflexElement flex={0.45} style={{ display: 'flex', flexDirection: 'column' }}>
            <ServerTable selectedCard={selectedCard.value} />
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

interface ServerItemProps {
  data: ServerInfoInterface
  isSelected: boolean
  onCardClick: (key: string) => void
}

const ServerItemCard = ({ data, isSelected, onCardClick }: ServerItemProps) => {
  return (
    <Card className={`${styles.rootCardNumber} ${isSelected ? styles.selectedCard : ''}`}>
      <CardActionArea onClick={() => onCardClick(data.id)}>
        <CardContent className="text-center">
          <Typography variant="h5" component="h5" className={styles.label}>
            {data.label}
          </Typography>
          <Typography variant="body1" component="p" className={styles.label}>
            {data.pods.filter((item) => item.status === 'Running').length}/{data.pods.length}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default Server
