import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import { useStyle, useStyles } from './styles'
import { columns, Data } from './Variables'

const FeedTable = () => {
  const classex = useStyle()
  const classes = useStyles()

  const createData = (
    id: any,
    featured: string,
    preview: string,
    video: string,
    creator: string,
    created: string
  ): Data => {
    return {
      id,
      featured,
      preview,
      video,
      creator,
      created,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            // onClick={() => {
            //   setPopConfirmOpen(true)
            //   setUserId(id)
            // }}
          >
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  return (
    <div className={classex.root}>
      <TableContainer className={classex.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
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
          <TableBody></TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default FeedTable
