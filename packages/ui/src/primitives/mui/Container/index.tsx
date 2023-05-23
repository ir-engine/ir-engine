import React, { ReactNode } from 'react'

import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { ContainerProps, Container as MuiContainer } from '@mui/material'

const Container = (props: ContainerProps & { component?: string }) => <MuiContainer {...props} />

Container.displayName = 'Container'

Container.defaultProps = {
  children: <Typography />
}

export default Container
