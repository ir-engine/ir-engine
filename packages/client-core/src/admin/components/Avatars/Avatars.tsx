import React, { useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import TablePagination from '@material-ui/core/TablePagination'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAppState } from '../../../common/reducers/app/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { PAGE_LIMIT } from '../../reducers/admin/reducers'
import { fetchLocationTypes } from '../../reducers/admin/location/service'
import { fetchAdminAvatars } from '../../reducers/admin/avatar/service'
import styles from './Avatars.module.scss'
import AddToContentPackModal from '../ContentPack/AddToContentPackModal'
import { selectAdminAvatarState } from '../../reducers/admin/avatar/selector'
import AvatarSelectMenu from '../../../user/components/UserMenu/menus/AvatarSelectMenu'
import { uploadAvatarModel } from '../../../user/reducers/auth/service'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  authState?: any
  locationState?: any
  fetchAdminAvatars?: any
  fetchLocationTypes?: any
  adminAvatarState?: any
  uploadAvatarModel?: Function
}

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    adminAvatarState: selectAdminAvatarState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminAvatars: bindActionCreators(fetchAdminAvatars, dispatch),
  fetchLocationTypes: bindActionCreators(fetchLocationTypes, dispatch),
  uploadAvatarModel: bindActionCreators(uploadAvatarModel, dispatch)
})

const Avatars = (props: Props) => {
  const { authState, fetchAdminAvatars, adminAvatarState, uploadAvatarModel } = props

  const user = authState.get('user')
  const adminAvatars = adminAvatarState.get('avatars').get('avatars')
  const adminThumbnails = adminAvatarState.get('avatars').get('thumbnails')
  const adminAvatarCount = adminAvatarState.get('avatars').get('total') / 2

  const headCell = [
    { id: 'sid', numeric: false, disablePadding: true, label: 'ID' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'key', numeric: false, disablePadding: false, label: 'Key' },
    { id: 'addToContentPack', numeric: false, disablePadding: false, label: 'Add to Content Pack' }
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
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_LIMIT)
  const [refetch, setRefetch] = useState(false)
  const [addToContentPackModalOpen, setAddToContentPackModalOpen] = useState(false)
  const [selectedAvatars, setSelectedAvatars] = useState([])
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
      const newSelecteds = adminAvatars.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    fetchAdminAvatars(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleCheck = (e: any, row: any) => {
    const newItem = {
      avatar: row,
      thumbnail: adminThumbnails.find((thumbnail) => thumbnail.name === row.name)
    }

    const existingAvatarIndex = selectedAvatars.findIndex((avatar) => avatar.avatar.id === row.id)
    if (e.target.checked === true) {
      if (existingAvatarIndex >= 0) setSelectedAvatars(selectedAvatars.splice(existingAvatarIndex, 1, newItem))
      else setSelectedAvatars(selectedAvatars.concat(newItem))
    } else setSelectedAvatars(selectedAvatars.splice(existingAvatarIndex, 1))
    setTimeout(() => {
      console.log('selectedAvatars after', selectedAvatars)
    }, 500)
  }

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  const closeAvatarSelectModal = () => {
    setAvatarSelectMenuOpen(false)
  }

  useEffect(() => {
    fetchTick()
  }, [])

  useEffect(() => {
    if (user?.id != null && (adminAvatarState.get('avatars').get('updateNeeded') === true || refetch === true)) {
      fetchAdminAvatars()
    }
    setRefetch(false)
  }, [authState, adminAvatarState, refetch])

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
          <Grid item xs={6}>
            <Button
              className={styles['open-modal']}
              type="button"
              variant="contained"
              color="primary"
              onClick={() => setAddToContentPackModalOpen(true)}
            >
              {dimensions.width <= 768 ? '+ Pack' : 'Add to Content Pack'}
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
              rowCount={adminAvatarCount / 2 || 0}
            />
            <TableBody>
              {stableSort(
                adminAvatars.filter((item) => item.staticResourceType === 'avatar'),
                getComparator(order, orderBy)
              )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
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
                      <TableCell className={styles.tcell} align="right">
                        {user.userRole === 'admin' && (
                          <Checkbox
                            className={styles.checkbox}
                            onChange={(e) => handleCheck(e, row)}
                            name="stereoscopic"
                            color="primary"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <div className={styles.tableFooter}>
          <TablePagination
            rowsPerPageOptions={[PAGE_LIMIT]}
            component="div"
            count={adminAvatarCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            className={styles.tablePagination}
          />
        </div>
        <AddToContentPackModal
          open={addToContentPackModalOpen}
          avatars={selectedAvatars}
          handleClose={() => setAddToContentPackModalOpen(false)}
        />
        {avatarSelectMenuOpen && (
          <AvatarSelectMenu
            changeActiveMenu={() => setAvatarSelectMenuOpen(false)}
            uploadAvatarModel={uploadAvatarModel}
            isPublicAvatar={true}
          />
        )}
      </Paper>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Avatars)
