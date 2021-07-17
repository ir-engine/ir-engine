// TODO: Make sure this is handled with routing
/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { PAGE_LIMIT } from '../reducers/admin/reducers'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  Paper,
  Button,
  Typography,
  CardMedia
} from '@material-ui/core'
// @ts-ignore
import styles from './Admin.module.scss'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import { EnhancedTableHead } from './AdminHelpers'
import { updateFeedAsAdmin } from '../../socialmedia/reducers/feed/service'
import SharedModal from './SharedModal'
import ArMediaForm from '../../socialmedia/components/ArMediaForm'
import { fetchAdminScenes } from '../reducers/admin/service'
import { selectAdminState } from '../reducers/admin/selector'
import { doLoginAuto } from '../../user/reducers/auth/service'
import { removeArMedia } from '../../socialmedia/reducers/arMedia/service'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  // router: any;
  adminState?: any
  authState?: any
  locationState?: any
  fetchAdminLocations?: any
  fetchAdminScenes?: any
  fetchLocationTypes?: any
  fetchUsersAsAdmin?: any
  fetchAdminInstances?: any
  removeUser?: any
  list?: any
  updateFeedAsAdmin?: typeof updateFeedAsAdmin
  doLoginAuto?: typeof doLoginAuto
  removeArMedia?: typeof removeArMedia
}
const mapStateToProps = (state: any): any => {
  return {
    adminState: selectAdminState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateFeedAsAdmin: bindActionCreators(updateFeedAsAdmin, dispatch),
  fetchAdminScenes: bindActionCreators(fetchAdminScenes, dispatch),
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  removeArMedia: bindActionCreators(removeArMedia, dispatch)
})

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

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

const ArMediaConsole = (props: Props) => {
  const classes = useStyles()
  const { list, updateFeedAsAdmin, fetchAdminScenes, adminState, doLoginAuto, removeArMedia } = props
  const adminScenes = adminState.get('scenes').get('scenes')

  const headCells = [
    { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
    { id: 'preview', numeric: false, disablePadding: false, label: 'Preview' },
    { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
    { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created' },
    { id: 'action', numeric: false, disablePadding: false, label: '' }
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
    return stabilizedThis.map((el) => {
      return el[0]
    })
  }

  useEffect(() => {
    doLoginAuto(true)
  }, [])

  useEffect(() => {
    fetchAdminScenes()
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('name')
  const [selected, setSelected] = React.useState<string[]>([])
  const [dense, setDense] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(PAGE_LIMIT)
  const [loading, setLoading] = React.useState(false)
  const [view, setView] = React.useState(null)

  // const adminUsers = adminState.get('users').get('users');
  const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // const handleView = (id: string) => {
  //     setView(list.find(item => item.id === id));
  //     setModalOpen(true);
  // };

  const handleDelete = (id: string) => {
    removeArMedia(id)
  }
  const handleClose = () => {
    setModalOpen(false)
  }

  // const handleUpdateFeed = (feed)=>{
  //     updateFeedAsAdmin(feed.id, feed);
  // };
  // const router = useRouter();
  // const routeTo = (route: string) => () => {
  //     router.push(route);
  //   };

  return (
    <div>
      <Typography variant="h1" color="primary">
        Media Resources List
      </Typography>
      <Button variant="outlined" color="secondary" onClick={() => setModalOpen(true)} style={{ width: 'fit-content' }}>
        Create
      </Button>
      <Paper className={styles.adminRoot}>
        <TableContainer className={styles.tableContainer}>
          <Table
            stickyHeader
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={headCells}
            />
            {list && list.length > 0 && (
              <TableBody className={styles.thead}>
                {stableSort(list, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <TableRow
                        hover
                        className={styles.trow}
                        style={{ color: 'black !important' }}
                        tabIndex={-1}
                        key={row.id}
                      >
                        <TableCell className={styles.tcell} align="center">
                          {row.type}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          <CardMedia
                            className={styles.previewImage}
                            image={row.previewUrl?.toString()}
                            title={row.title?.toString()}
                          />
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {row.title}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.createdAt}
                        </TableCell>
                        <TableCell className={styles.tcell}>
                          {/* <Button variant="outlined" color="secondary" style={{width:'fit-content'}} onClick={() => handleView(row.id.toString())}><Edit className="text-success"/>Edit</Button> */}
                          <Button
                            variant="outlined"
                            color="secondary"
                            style={{ width: 'fit-content' }}
                            onClick={() => handleDelete(row.id.toString())}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        {modalOpen && (
          <SharedModal open={modalOpen} TransitionComponent={Transition} onClose={handleClose}>
            <ArMediaForm projects={adminScenes} view={view} />
          </SharedModal>
        )}
      </Paper>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ArMediaConsole)
