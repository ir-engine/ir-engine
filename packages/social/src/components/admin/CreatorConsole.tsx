/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react'

import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Paper from '@mui/material/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import styles from '@xrengine/client-core/src/admin/components/Admin.module.scss'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { Edit } from '@mui/icons-material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import { EnhancedTableHead } from '@xrengine/client-core/src/admin/components/AdminHelpers'
import CreatorForm from '@xrengine/social/src/components/CreatorForm'
import SharedModal from '@xrengine/client-core/src/admin/components/SharedModal'
import CreatorCard from '@xrengine/social/src/components/CreatorCard'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'
import { ADMIN_PAGE_LIMIT } from '@xrengine/client-core/src/admin/services/AdminService'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  authState?: any
  locationState?: any
  fetchAdminInstances?: any
  removeUser?: any
  list?: any
}

interface HeadCell {
  disablePadding: boolean
  id: string
  label: string
  numeric: boolean
}

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

const CreatorConsole = (props: Props) => {
  const classes = useStyles()
  const { list } = props
  const headCells = [
    { id: 'avatar', numeric: false, disablePadding: false, label: '' },
    { id: 'verified', numeric: false, disablePadding: false, label: 'Verified' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'username', numeric: false, disablePadding: false, label: 'UserName' },
    { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
    { id: 'userId', numeric: false, disablePadding: false, label: 'User ID' },
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

  const [creatorModalOpen, setCreatorModalOpen] = useState(false)
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('name')
  const [selected, setSelected] = React.useState<string[]>([])
  const [dense, setDense] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(ADMIN_PAGE_LIMIT)
  const [loading, setLoading] = React.useState(false)
  const [creatorEdit, setCreatorEdit] = React.useState(null)
  const [creatorData, setCreatorData] = React.useState(null)
  const [creatorView, setCreatorView] = React.useState(false)

  const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleCreatorClick = (id: string) => {
    setCreatorEdit(list.find((creator) => creator.id === id))
    setCreatorModalOpen(true)
  }

  const handleCreatorClose = () => {
    setCreatorModalOpen(false)
  }

  const handleCreatorView = (id: string) => {
    setCreatorData(list.find((creator) => creator.id === id))
    setCreatorView(true)
  }

  const handleClose = () => {
    setCreatorView(false)
    setCreatorData(null)
  }

  const handleUpdateCreator = (creator) => {
    CreatorService.updateCreator(creator)
  }
  return (
    <div>
      <Typography variant="h1" color="primary">
        Social Creators List
      </Typography>
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
            <TableBody className={styles.thead}>
              {stableSort(list, getComparator(order, orderBy)).map((row, index) => {
                return (
                  <TableRow
                    hover
                    className={styles.trow}
                    style={{ color: 'black !important' }}
                    tabIndex={-1}
                    key={row.id}
                  >
                    <TableCell className={styles.tcell} align="center">
                      <Avatar src={row.avatar.toString()} />
                    </TableCell>
                    <TableCell className={styles.tcell} align="center">
                      <VerifiedUserIcon
                        htmlColor={row.verified === 1 ? '#007AFF' : '#FFFFFF'}
                        style={{ fontSize: '25px', margin: '0 0 0 5px' }}
                      />
                    </TableCell>
                    <TableCell className={styles.tcell} align="left">
                      {row.name}
                    </TableCell>
                    <TableCell className={styles.tcell} align="left">
                      {row.username}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.email}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.userId}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.createdAt}
                    </TableCell>
                    <TableCell className={styles.tcell + ' ' + styles.actionCell}>
                      {row.verified === 1 ? (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleUpdateCreator({ id: row.id.toString(), verified: 0 })}
                        >
                          UnVerify
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleUpdateCreator({ id: row.id.toString(), verified: 1 })}
                        >
                          Verify
                        </Button>
                      )}
                      <Button variant="outlined" color="secondary" onClick={() => handleCreatorView(row.id.toString())}>
                        <MoreHorizIcon className="text-success" />
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleCreatorClick(row.id.toString())}
                      >
                        <Edit className="text-success" />{' '}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {creatorEdit && (
          <SharedModal
            open={creatorModalOpen}
            TransitionComponent={Transition}
            onClose={handleCreatorClose}
            title={`Editing ${(creatorEdit as any).name}`}
          >
            <CreatorForm creatorData={creatorEdit} />
          </SharedModal>
        )}
        {creatorData && (
          <SharedModal open={creatorView} TransitionComponent={Transition} onClose={handleClose}>
            <CreatorCard creator={creatorData} />
          </SharedModal>
        )}
      </Paper>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}

export default CreatorConsole
