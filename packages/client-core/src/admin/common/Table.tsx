import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useStyles } from '../styles/ui'
import TablePagination from '@mui/material/TablePagination'

interface Props {
  rows: any
  column: any
  page: number
  rowsPerPage: number
  count: number
  handlePageChange: (e: unknown, newPage: number) => void
  handleRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TableComponent = (props: Props) => {
  const classes = useStyles()
  const { rows, column, page, rowsPerPage, count, handlePageChange, handleRowsPerPageChange } = props

  return (
    <div>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {column.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classes.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {column.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classes.tableCellBody}>
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
        className={classes.tableFooter}
      />
    </div>
  )
}

export default TableComponent
