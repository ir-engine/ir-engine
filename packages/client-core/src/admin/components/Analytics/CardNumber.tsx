import React from 'react'

import Card from '@etherealengine/ui/src/primitives/mui/Card'
import CardContent from '@etherealengine/ui/src/primitives/mui/CardContent'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import styles from '../../styles/admin.module.scss'

interface Props {
  data: {
    number: number
    label: string
    color1: string
    color2: string
  }
}

const CardNumber = ({ data }: Props) => {
  return (
    <Card className={styles.rootCardNumber}>
      <CardContent className="text-center">
        <Typography variant="h3" component="h3" className={styles.label}>
          <span>{data.number}</span>
        </Typography>
        <Typography variant="body2" component="p" className={styles.label}>
          <span>{data.label}</span>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default CardNumber
