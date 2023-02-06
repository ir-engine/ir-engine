import React, { ReactNode } from 'react'

import { TableBody as MuiTableBody } from '@mui/material'

import TableCell from '../TableCell'
import TableRow from '../TableRow'

export interface Props {
  children: ReactNode
  className?: string
}

const TableBody = ({ children, ...props }: Props) => <MuiTableBody {...props}>{children}</MuiTableBody>

TableBody.displayName = 'TableBody'

TableBody.defaultProps = {
  children: (
    <TableRow>
      <TableCell>Hello</TableCell>
    </TableRow>
  )
}

export default TableBody
