import React, { useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Cached from '@material-ui/icons/Cached'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import TablePagination from '@material-ui/core/TablePagination'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '../../../user/state/AuthState'
import { REALITY_PACK_PAGE_LIMIT } from '../../state/RealityPackState'
import { LocationService } from '../../state/LocationService'
import { fetchAdminRealityPacks } from '../../state/RealityPackService'
import styles from './RealityPack.module.scss'
import AddToContentPackModal from '../ContentPack/AddToContentPackModal'
import UploadRealityPackModel from '../ContentPack/UploadRealityPackModel'
import { useRealityPackState } from '../../state/RealityPackState'
import { ContentPackService } from '../../state/ContentPackService'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

const RealityPack = () => {
  const authState = useAuthState()
  const user = authState.user
  const adminRealityPackState = useRealityPackState()
  const adminRealityPacks = adminRealityPackState.realityPacks.realityPacks
  const adminRealityPackCount = adminRealityPackState.realityPacks.total
  const dispatch = useDispatch()

  const headCell = [
    { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'addToContentPack', numeric: false, disablePadding: false, label: 'Add to Content Pack' },
    { id: 'update', numeric: false, disablePadding: true, label: 'Update' }
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
    const returned = stabilizedThis.map((el) => el[0])
    return returned
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
  const [orderBy, setOrderBy] = useState<string>('name')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(REALITY_PACK_PAGE_LIMIT)
  const [refetch, setRefetch] = useState(false)
  const [addToContentPackModalOpen, setAddToContentPackModalOpen] = useState(false)
  const [uploadRealityPackModalOpen, setUploadRealityPackModalOpen] = useState(false)
  const [selectedRealityPacks, setSelectedRealityPacks] = useState<AdminRealityPack[]>([])
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
      const newSelecteds = adminRealityPacks.value.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    fetchAdminRealityPacks(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleCheck = (e: any, row: any) => {
    const existingRealityPackIndex = selectedRealityPacks.findIndex((realityPack) => realityPack.id === row.id)
    if (e.target.checked === true) {
      if (existingRealityPackIndex >= 0)
        setSelectedRealityPacks(selectedRealityPacks.splice(existingRealityPackIndex, 1, row))
      else setSelectedRealityPacks(selectedRealityPacks.concat(row))
    } else setSelectedRealityPacks(selectedRealityPacks.splice(existingRealityPackIndex, 1))
  }

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  const tryReuploadRealityPack = async (row) => {
    try {
      const existingRealityPack = adminRealityPacks.value.find((realityPack) => realityPack.id === row.id)
      await ContentPackService.uploadRealityPack({
        uploadURL: existingRealityPack.sourceManifest
      })
    } catch (err) {
      console.log(err)
    }
  }

  // useEffect(() => {
  //   fetchTick()
  // }, [])

  useEffect(() => {
    if (
      user?.id.value != null &&
      (adminRealityPackState.realityPacks.updateNeeded.value === true || refetch === true)
    ) {
      fetchAdminRealityPacks()
    }
    setRefetch(false)
  }, [authState, adminRealityPackState.realityPacks.updateNeeded.value, refetch])

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
              onClick={() => setUploadRealityPackModalOpen(true)}
            >
              {'Add Reality Pack'}
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
              object={'realityPacks'}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={adminRealityPackCount?.value || 0}
            />
            <TableBody>
              {stableSort(adminRealityPacks?.value ?? [], getComparator(order, orderBy)).map((row, index) => {
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
                      {row.id}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.name}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {user.userRole.value === 'admin' && (
                        <Checkbox
                          className={styles.checkbox}
                          onChange={(e) => handleCheck(e, row)}
                          name="stereoscopic"
                          color="primary"
                        />
                      )}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {user.userRole.value === 'admin' && (
                        <Button
                          className={styles.checkbox}
                          onClick={(e) => tryReuploadRealityPack(row)}
                          name="stereoscopic"
                          color="primary"
                        >
                          <Cached />
                        </Button>
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
            rowsPerPageOptions={[REALITY_PACK_PAGE_LIMIT]}
            component="div"
            count={adminRealityPackCount?.value || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            className={styles.tablePagination}
          />
        </div>
        <AddToContentPackModal
          open={addToContentPackModalOpen}
          realityPacks={selectedRealityPacks}
          handleClose={() => setAddToContentPackModalOpen(false)}
        />
        <UploadRealityPackModel
          open={uploadRealityPackModalOpen}
          handleClose={() => setUploadRealityPackModalOpen(false)}
        />
      </Paper>
    </div>
  )
}

export default RealityPack
