import React, { ReactNode } from 'react'

import TableCell from '@etherealengine/ui/src/primitives/mui/TableCell'
import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'

import { TableBody as MuiTableBody } from '@mui/material'

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
