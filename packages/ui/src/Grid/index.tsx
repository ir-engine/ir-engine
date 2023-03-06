import React, { ReactNode } from 'react'

import { GridProps, Grid as MuiGrid } from '@mui/material'

export interface Props {
  children: ReactNode
}

const Grid = ({ children, ...props }: GridProps) => <MuiGrid {...props}>{children}</MuiGrid>

Grid.displayName = 'Grid'

Grid.defaultProps = {
  children: null
}

export default Grid
