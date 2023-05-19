import React, { ReactNode } from 'react'

import CardMedia from '@etherealengine/ui/src/primitives/mui/CardMedia'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { CardContentProps, CardContent as MuiCardContent } from '@mui/material'

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
