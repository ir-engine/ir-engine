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

import clsx from 'clsx'
import React from 'react'

import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Paper from '@etherealengine/ui/src/primitives/mui/Paper'
import Table from '@etherealengine/ui/src/primitives/mui/Table'
import TableBody from '@etherealengine/ui/src/primitives/mui/TableBody'
import TableCell from '@etherealengine/ui/src/primitives/mui/TableCell'
import TableContainer from '@etherealengine/ui/src/primitives/mui/TableContainer'
import TableHead from '@etherealengine/ui/src/primitives/mui/TableHead'
import TablePagination from '@etherealengine/ui/src/primitives/mui/TablePagination'
import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'
import TableSortLabel from '@etherealengine/ui/src/primitives/mui/TableSortLabel'
import Toolbar from '@etherealengine/ui/src/primitives/mui/Toolbar'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { lighten, Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

interface Data {
  id: number
  description: string
  links: string
  action: any
}

function createData(id: number, description: string, links: string, action: any): Data {
  return { id, description, links, action }
}

const rows = [
  createData(1, 'Cupcake', 'https://api-dev.etherealengine.com/openapi/', 'send'),
  createData(2, 'Donut', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(3, 'Eclair', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(4, 'Frozen yoghurt', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(5, 'Gingerbread', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(6, 'Honeycomb', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(7, 'Ice cream sandwich', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(8, 'Jelly Bean', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(9, 'KitKat', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(10, 'Lollipop', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(11, 'Marshmallow', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(12, 'Nougat', 'https://api-dev.etherealengine.com/openapi/', 'Send'),
  createData(13, 'Oreo', 'https://api-dev.etherealengine.com/openapi/', 'Send')
]

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

type Order = 'asc' | 'desc'

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

interface HeadCell {
  disablePadding: boolean
  id: keyof Data
  label: string
  numeric: boolean
}

const headCells: HeadCell[] = [
  { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
  { id: 'description', numeric: true, disablePadding: false, label: 'Description' },
  { id: 'links', numeric: true, disablePadding: false, label: 'Links' },
  { id: 'action', numeric: true, disablePadding: false, label: 'Action' }
]

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>
  numSelected: number
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: Order
  orderBy: string
  rowCount: number
}

function EnhancedTableHead({
  classes,
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort
}: EnhancedTableProps) {
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const useToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1)
    },
    highlight:
      theme.palette.mode === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85)
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark
          },
    title: {
      flex: '1 1 100%'
    }
  })
)

interface EnhancedTableToolbarProps {
  numSelected: number
}

const EnhancedTableToolbar = ({ numSelected }: EnhancedTableToolbarProps) => {
  const classes = useToolbarStyles()

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          APIS Links
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton title="delete" size="large" icon={<Icon type="Delete" />} />
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton title="filter list" size="large" icon={<Icon type="FilterList" />} />
        </Tooltip>
      )}
    </Toolbar>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2)
    },
    table: {
      minWidth: 750
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1
    }
  })
)

export default function ApiLinks() {
  const classes = useStyles()
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<keyof Data>('description')
  const [selected, setSelected] = React.useState<number[]>([])
  const [page, setPage] = React.useState(0)
  const [dense, setDense] = React.useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event: React.MouseEvent<unknown>, name: number) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected: number[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }

    setSelected(newSelected)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSelected = (name: any) => selected.indexOf(name) !== -1

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id)
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.id}
                      </TableCell>
                      <TableCell align="right">{row.description}</TableCell>
                      <TableCell align="right">{row.links}</TableCell>
                      <TableCell align="right">
                        <a className="text-dark">{row.action}</a>
                      </TableCell>
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </div>
  )
}
