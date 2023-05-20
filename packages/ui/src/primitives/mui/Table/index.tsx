import React, { ReactNode } from 'react'

import TableBody from '@etherealengine/ui/src/primitives/mui/TableBody'
import TableCell from '@etherealengine/ui/src/primitives/mui/TableCell'
import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'

import { Table as MuiTable, TableProps } from '@mui/material'

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
