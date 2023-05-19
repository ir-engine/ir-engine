import React, { ReactNode } from 'react'

import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { FadeProps, Fade as MuiFade } from '@mui/material'

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
