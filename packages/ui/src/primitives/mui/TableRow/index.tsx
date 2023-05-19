import React, { ReactNode } from 'react'

import TableCell from '@etherealengine/ui/src/primitives/mui/TableCell'

import { TableRow as MuiTableRow, TableRowProps } from '@mui/material'

const TableRow = ({ children, ...props }: TableRowProps) => <MuiTableRow {...props}>{children}</MuiTableRow>

TableRow.displayName = 'TableRow'

TableRow.defaultProps = {
  children: <TableCell />
}

export default TableRow
