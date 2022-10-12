import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ServerInfoInterface, ServerPodInfo } from '@xrengine/common/src/interfaces/ServerInfo'

import { Card, CardActionArea, CardContent, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

import LoadingView from '../../common/LoadingView'
import { ServerInfoService } from '../../services/ServerInfoService'
import styles from '../../styles/admin.module.scss'

const Server = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState('all')
  const [serverInfo, setServerInfo] = useState<ServerInfoInterface[]>([])

  useEffect(() => {
    loadServerInfo()
  }, [])

  const loadServerInfo = async () => {
    setIsLoading(true)
    let response: ServerInfoInterface[] = await ServerInfoService.fetchServerInfo()

    const allPods: ServerPodInfo[] = []
    for (const item of response) {
      allPods.push(...item.pods)
    }

    response = [
      {
        id: 'all',
        label: 'All',
        pods: allPods
      },
      ...response
    ]
    setServerInfo(response)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <LoadingView title={t('admin:components.server.loading')} variant="body2" sx={{ position: 'absolute', top: 0 }} />
    )
  }

  return (
    <Grid container spacing={1} className={styles.mb10px}>
      {serverInfo.map((item, index) => (
        <Grid item xs={12} sm={6} md={2}>
          <ServerItemCard key={index} data={item} isSelected={selectedCard === item.id} onCardClick={setSelectedCard} />
        </Grid>
      ))}
    </Grid>
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
