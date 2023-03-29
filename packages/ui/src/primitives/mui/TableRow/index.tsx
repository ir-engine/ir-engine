import React, { ReactNode } from 'react'

import { TableRow as MuiTableRow, TableRowProps } from '@mui/material'

import TableCell from '../TableCell'

const TableRow = ({ children, ...props }: TableRowProps) => <MuiTableRow {...props}>{children}</MuiTableRow>

TableRow.displayName = 'TableRow'

TableRow.defaultProps = {
  children: <TableCell />
}

export default TableRow
