import React, { ReactNode } from 'react'

import { TableCell as MuiTableCell, TableCellProps } from '@mui/material'

const TableCell = ({ children, ...props }: TableCellProps) => <MuiTableCell {...props}>{children}</MuiTableCell>

TableCell.displayName = 'TableCell'

TableCell.defaultProps = {
  children: null
}

export default TableCell
