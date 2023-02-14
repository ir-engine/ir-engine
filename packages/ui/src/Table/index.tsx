import React, { ReactNode } from 'react'

import { Table as MuiTable, TableProps } from '@mui/material'

import TableBody from '../TableBody'
import TableCell from '../TableCell'
import TableRow from '../TableRow'

const Table = ({ children, ...props }: TableProps) => <MuiTable {...props}>{children}</MuiTable>

Table.displayName = 'Table'

Table.defaultProps = {
  children: (
    <TableBody>
      <TableRow>
        <TableCell>Hello</TableCell>
      </TableRow>
    </TableBody>
  )
}

export default Table
