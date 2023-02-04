import React, { ReactNode } from 'react'

import { TableRow as MuiTableRow, TableRowProps } from '@mui/material'

const TableRow = ({ children, ...props }: TableRowProps) => <MuiTableRow {...props}>{children}</MuiTableRow>

TableRow.displayName = 'TableRow'

TableRow.defaultProps = {
  children: null
}

export default TableRow
