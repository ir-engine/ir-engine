import React, { memo } from 'react'

import { ServerInfoInterface } from '@etherealengine/common/src/interfaces/ServerInfo'

import { Card, CardActionArea, CardContent, Typography } from '@mui/material'

import styles from '../../styles/admin.module.scss'

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

ServerItemCard.displayName = 'ServerItemCard'

ServerItemCard.defaultPros = {}

export default memo(ServerItemCard)
