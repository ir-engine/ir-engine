import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import React from 'react'
import { useStyles } from '../styles/ui'

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
    <React.Fragment>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {column.map((column, index) => (
                <TableCell
                  key={index}
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
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rIndex) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={rIndex}>
                  {column.map((column, index) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={index} align={column.align} className={classes.tableCellBody}>
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
    </React.Fragment>
  )
}

export default TableComponent
