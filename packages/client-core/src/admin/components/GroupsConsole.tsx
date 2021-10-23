import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import React from 'react'
import styles from './Admin.module.scss'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 120,
      backgroundColor: 'white'
    },
    selectEmpty: {
      marginTop: theme.spacing(0)
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff'
    }
  })
)

/**
 * Function for create group on  admin dashboard
 *
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

export default function GroupsConsole() {
  const classes = useStyles()
  const [dense, setDense] = React.useState(false)

  const headCells = {
    groups: [
      { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
      { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
      { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
      { id: 'action', numeric: false, disablePadding: false, label: 'Action' }
    ]
  }

  type Order = 'asc' | 'desc'

  interface EnhancedTableProps {
    numSelected?: number
    onRequestSort?: (event: React.MouseEvent<unknown>, property) => void
    order?: Order
    orderBy?: string
  }

  function EnchancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props
    const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
      onRequestSort && onRequestSort(event, property)
    }

    return (
      <TableHead className={styles.thead}>
        <TableRow className={styles.trow}>
          {headCells.groups.map((headCell) => (
            <TableCell
              className={styles.tcell}
              key={headCell.id}
              align="right"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    )
  }

  return (
    <div>
      <Paper className={styles.adminRoot}>
        <TableContainer className={styles.tableContainer}>
          <Table
            stickyHeader
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnchancedTableHead />
            <TableBody className={styles.thead} />
          </Table>
        </TableContainer>
      </Paper>
    </div>
  )
}
