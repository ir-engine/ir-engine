/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import Table from '@etherealengine/ui/src/primitives/mui/Table'
import TableBody from '@etherealengine/ui/src/primitives/mui/TableBody'
import TableCell from '@etherealengine/ui/src/primitives/mui/TableCell'
import TableContainer from '@etherealengine/ui/src/primitives/mui/TableContainer'
import TableHead from '@etherealengine/ui/src/primitives/mui/TableHead'
import TablePagination from '@etherealengine/ui/src/primitives/mui/TablePagination'
import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'
import TableSortLabel from '@etherealengine/ui/src/primitives/mui/TableSortLabel'

import { FeathersOrder, useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import styles from '../styles/table.module.scss'

const SortDirection = {
  '-1': 'desc',
  0: 'asc',
  1: 'asc'
} as const

interface Props {
  query: ReturnType<typeof useFind>
  rows: any
  column: any
  allowSort?: boolean
}

interface Data {
  calories: number
  carbs: number
  fat: number
  name: string
  protein: number
}

interface HeadCell {
  disablePadding: boolean
  id: keyof Data
  label: string
  align?: 'right'
  minWidth: any
  sortable?: boolean
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator<Key extends keyof any>(
  order: FeathersOrder,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === -1 ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data, order: FeathersOrder) => void
  order: FeathersOrder
  orderBy: string
  rowCount: number
  columns: HeadCell[]
}

const EnhancedTableHead = ({ order, orderBy, onRequestSort, columns }: EnhancedTableProps) => {
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property, order)
  }

  return (
    <TableHead>
      <TableRow>
        {columns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? SortDirection[order] : false}
            className={styles.tableCellHeader}
            style={{ minWidth: headCell.minWidth }}
          >
            {(headCell.id as any) === 'action' || (headCell.id as any) === 'select' ? (
              <span>{headCell.label} </span>
            ) : typeof headCell.sortable === 'undefined' || headCell.sortable === true ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? SortDirection[order] : 'asc'}
                onClick={createSortHandler(headCell.id)}
                classes={{ icon: styles.spanWhite, active: styles.spanWhite }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span style={{ display: 'none', border: 0, clip: 'rect(0 0 0 0)' }}>
                    {order === -1 ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            ) : (
              <div className={styles.spanWhite}>{headCell.label}</div>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const TableComponent = ({ rows, column, allowSort, query }: Props) => {
  const [orderBy, order] = (Object.entries(query.sort)[0] as [keyof Data, FeathersOrder]) ?? []

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data, order: FeathersOrder) => {
    query.setSort({ [property]: order === 1 ? -1 : 1 })
  }

  return (
    <React.Fragment>
      <TableContainer className={styles.tableContainer}>
        <Table stickyHeader aria-label="sticky table">
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            columns={column}
          />
          <TableBody>
            {(allowSort ? stableSort(rows, getComparator(order, orderBy)) : rows).map((row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={`${index}${row.name}`}>
                  {column.map((column, index) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={index} align={column.align} className={styles.tableCellBody}>
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPage={query.limit}
        rowsPerPageOptions={[20]}
        // rowsPerPageOptions={[10, 20, 50, 100]}
        onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          query.setLimit(parseInt(event.target.value, 10))
        }}
        component="div"
        count={query.total}
        page={query.page}
        onPageChange={(event, page) => query.setPage(page)}
        className={styles.tableFooter}
      />
    </React.Fragment>
  )
}

export default TableComponent
