import React, { ReactNode } from 'react'

import { Table as MuiTable, TableProps } from '@mui/material'

const Table = ({ children, ...props }: TableProps) => <MuiTable {...props}>{children}</MuiTable>

Table.displayName = 'Table'

Table.defaultProps = {
  children: null
}

export default Table
