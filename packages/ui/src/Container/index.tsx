import React, { ReactNode } from 'react'

import { ContainerProps, Container as MuiContainer } from '@mui/material'

import Typography from '../Typography'

const Container = (props: ContainerProps & { component?: string }) => <MuiContainer {...props} />

Container.displayName = 'Container'

Container.defaultProps = {
  children: <Typography />
}

export default Container
