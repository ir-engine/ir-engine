import React, { ReactNode } from 'react'

import { CardProps, Card as MuiCard } from '@mui/material'

import CardContent from '../CardContent'
import Typography from '../Typography'

const Card = (props: CardProps) => <MuiCard {...props} />

Card.displayName = 'Card'

Card.defaultProps = {
  sx: { minWidth: 275 },
  children: (
    <>
      <CardContent />
    </>
  )
}

export default Card
