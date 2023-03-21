import React, { ReactElement } from 'react'

import Box from '@etherealengine/ui/src/Box'
import Table from '@etherealengine/ui/src/Table'
import TableBody from '@etherealengine/ui/src/TableBody'
import TableCell from '@etherealengine/ui/src/TableCell'
import TableContainer from '@etherealengine/ui/src/TableContainer'
import TableHead from '@etherealengine/ui/src/TableHead'
import TablePagination from '@etherealengine/ui/src/TablePagination'
import TableRow from '@etherealengine/ui/src/TableRow'
import TableSortLabel from '@etherealengine/ui/src/TableSortLabel'

import { visuallyHidden } from '@mui/utils'

import styles from '../styles/table.module.scss'

interface TableData {
  [key: string]: ReactElement
}

interface Props<Data extends TableData> {
  rows: Data[]
  column: Column<Data>[]
  page: number
  rowsPerPage: number
  count: number
  fieldOrder?: Order
  fieldOrderBy?: keyof Data
  allowSort?: boolean
  setSortField?: (field: keyof Data) => void
  setFieldOrder?: (order: Order) => void
  handlePageChange: (e: unknown, newPage: number) => void
  handleRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export type Order = 'asc' | 'desc'

interface Column<Data> {
  id: keyof Data
  label: string
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  minWidth?: number | string
  disablePadding?: boolean
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

function getComparator<Data>(order: Order, orderBy: keyof Data): (a: Data, b: Data) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
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

interface EnhancedTableProps<Data> {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void
  order: Order
  orderBy: keyof Data
  rowCount: number
  columns: Column<Data>[]
}

const EnhancedTableHead = function <Data>({ order, orderBy, onRequestSort, columns }: EnhancedTableProps<Data>) {
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {columns.map((headCell) => (
          <TableCell
            key={String(headCell.id)}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            className={styles.tableCellHeader}
            style={{ minWidth: headCell.minWidth }}
          >
            {headCell.id === 'action' || headCell.id === 'select' ? (
              <span>{headCell.label} </span>
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                classes={{ icon: styles.spanWhite, active: styles.spanWhite }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const TableComponent = function <Data extends TableData>({
  rows,
  column,
  page,
  rowsPerPage,
  count,
  fieldOrder,
  fieldOrderBy,
  allowSort,
  setSortField,
  setFieldOrder,
  handlePageChange,
  handleRowsPerPageChange
}: Props<Data>) {
  const [order, setOrder] = React.useState<Order>(fieldOrder === 'desc' ? 'desc' : 'asc')
  const [orderBy, setOrderBy] = React.useState<keyof Data>(fieldOrderBy ? fieldOrderBy : column[0].id)
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setSortField && setSortField(property)
    setFieldOrder && setFieldOrder(order)
    setOrderBy(property)
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
                <TableRow hover role="checkbox" tabIndex={-1} key={`${index}`}>
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
        rowsPerPageOptions={[12]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={styles.tableFooter}
      />
    </React.Fragment>
  )
}

export default TableComponent
