import React, { ReactNode } from 'react'

import { TableBody as MuiTableBody } from '@mui/material'

export interface Props {
  children: ReactNode
  className?: string
}

const TableBody = ({ children, ...props }: Props) => <MuiTableBody {...props}>{children}</MuiTableBody>

TableBody.displayName = 'TableBody'

TableBody.defaultProps = {
  children: null
}

export default TableBody
