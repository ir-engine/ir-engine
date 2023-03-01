import React, { ReactNode } from 'react'

import { TableContainer as MuiTableContainer, TableContainerProps } from '@mui/material'

const TableContainer = ({ children, ...props }: TableContainerProps) => (
  <MuiTableContainer {...props}>{children}</MuiTableContainer>
)

TableContainer.displayName = 'TableContainer'

TableContainer.defaultProps = {
  children: null
}

export default TableContainer
