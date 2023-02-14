import React, { ReactNode } from 'react'

import { FadeProps, Fade as MuiFade } from '@mui/material'

import Typography from '../Typography'

const Fade = (props: FadeProps) => <MuiFade {...props} />

Fade.displayName = 'Fade'

Fade.defaultProps = {
  children: (
    <div>
      <Typography />
    </div>
  )
}

export default Fade
