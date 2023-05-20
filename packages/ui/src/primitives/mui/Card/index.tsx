import React, { ReactNode } from 'react'

import CardContent from '@etherealengine/ui/src/primitives/mui/CardContent'

import { CardProps, Card as MuiCard } from '@mui/material'

// import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

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
