import React, { ReactNode } from 'react'

import { CardContentProps, CardContent as MuiCardContent } from '@mui/material'

import CardMedia from '../CardMedia'
import Typography from '../Typography'

const CardContent = (props: CardContentProps) => <MuiCardContent {...props} />

CardContent.displayName = 'CardContent'

CardContent.defaultProps = {
  children: (
    <>
      <Typography />
      <CardMedia />
    </>
  )
}

export default CardContent
