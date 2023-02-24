import React, { ReactNode } from 'react'

import { CardActionAreaProps, CardActionArea as MuiCardActionArea } from '@mui/material'

const CardActionArea = (props: CardActionAreaProps) => <MuiCardActionArea {...props} />

CardActionArea.displayName = 'CardActionArea'

CardActionArea.defaultProps = {}

export default CardActionArea
