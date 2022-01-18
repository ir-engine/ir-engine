import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import TablePagination from '@mui/material/TablePagination'
import { useAuthState } from '../../../user/services/AuthService'
import { AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import styles from './Avatars.module.scss'
import { useAvatarState } from '../../services/AvatarService'
import AvatarSelectMenu from '../../../user/components/UserMenu/menus/AvatarSelectMenu'
import { AvatarService } from '../../services/AvatarService'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  locationState?: any
}

const Avatars = (props: Props) => {
  const adminAvatarState = useAvatarState()
  const authState = useAuthState()
  const user = authState.user
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total

  const headCell = [
    { id: 'sid', numeric: false, disablePadding: true, label: 'ID' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'key', numeric: false, disablePadding: false, label: 'Key' }
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

  function getComparator<Key extends keyof any>(order: Order, orderBy: Key) {
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

  interface EnhancedTableProps {
    object: string
    numSelected: number
    onRequestSort: (event: React.MouseEvent<unknown>, property) => void
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
    order: Order
    orderBy: string
    rowCount: number
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { object, order, orderBy, onRequestSort } = props
    const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

    return (
      <TableHead className={styles.thead}>
        <TableRow className={styles.trow}>
          {headCell.map((headCell) => (
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

  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<any>('name')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(AVATAR_PAGE_LIMIT)
  const [refetch, setRefetch] = useState(false)
  const [avatarSelectMenuOpen, setAvatarSelectMenuOpen] = useState(false)
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = adminAvatars.value.map((n) => n.name!)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    AvatarService.fetchAdminAvatars(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  useEffect(() => {
    if (user?.id.value != null && (adminAvatarState.updateNeeded.value || refetch === true)) {
      AvatarService.fetchAdminAvatars()
    }
    setRefetch(false)
  }, [authState.user?.id?.value, adminAvatarState.updateNeeded.value, refetch])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const handleWindowResize = () => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth
    })
  }

  return (
    <div>
      <Paper className={styles.adminRoot}>
        <Grid container spacing={3} className={styles.marginBottom}>
          <Grid item xs={6}>
            <Button
              className={styles['open-modal']}
              type="button"
              variant="contained"
              color="primary"
              onClick={() => setAvatarSelectMenuOpen(true)}
            >
              Upload Avatar
            </Button>
          </Grid>
        </Grid>
        <TableContainer className={styles.tableContainer}>
          <Table stickyHeader aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
            <EnhancedTableHead
              object={'avatars'}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={adminAvatarCount.value || 0}
            />
            <TableBody>
              {stableSort(adminAvatars.value, getComparator(order, orderBy)).map((row, index) => {
                return (
                  <TableRow
                    hover
                    className={styles.trowHover}
                    style={{ color: 'black !important' }}
                    // onClick={(event) => handleLocationClick(event, row.id.toString())}
                    tabIndex={-1}
                    key={row.id}
                  >
                    <TableCell
                      className={styles.tcell}
                      component="th"
                      id={row.id.toString()}
                      align="right"
                      scope="row"
                      padding="none"
                    >
                      {row.sid}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.name}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.key}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <div className={styles.tableFooter}>
          <TablePagination
            rowsPerPageOptions={[AVATAR_PAGE_LIMIT]}
            component="div"
            count={adminAvatarCount.value}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            className={styles.tablePagination}
          />
        </div>
        {avatarSelectMenuOpen && (
          <AvatarSelectMenu changeActiveMenu={() => setAvatarSelectMenuOpen(false)} isPublicAvatar={true} />
        )}
      </Paper>
    </div>
  )
}

export default Avatars
