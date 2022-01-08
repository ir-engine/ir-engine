import React, { useEffect, useState } from 'react'

import { InstanceSeed } from '@xrengine/common/src/interfaces/Instance'

// import CreateInstance from './Instance/CreateInstance'
import { Delete, Edit } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Slide from '@mui/material/Slide'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { Theme } from '@mui/material/styles'
import { TransitionProps } from '@mui/material/transitions'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import { useDispatch } from '../../store'
import { useAuthState } from '../../user/services/AuthService'
import { ADMIN_PAGE_LIMIT } from '../services/AdminService'
import { useInstanceState } from '../services/InstanceService'
import { InstanceService } from '../services/InstanceService'
import styles from './Admin.module.scss'
import InstanceModal from './Instance/InstanceModal'
import Search from './Search'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  locationState?: any
}

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    marginBottom: {
      marginBottom: '10px'
    }
  })
)

/**
 * Function for instance index admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

function InstanceConsole(props: Props) {
  const classes = useStyles()

  const adminInstanceState = useInstanceState()
  const user = useAuthState().user
  const [selectedInstance, setSelectedInstance] = useState(InstanceSeed)
  const [instanceCreateOpen, setInstanceCreateOpen] = useState(false)
  const [instanceModalOpen, setInstanceModalOpen] = useState(false)
  const adminInstances = adminInstanceState.instances.instances

  const headCells = {
    instances: [
      { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
      { id: 'ipAddress', numeric: false, disablePadding: false, label: 'IP address' },
      { id: 'gsId', numeric: false, disablePadding: false, label: 'Gameserver ID' },
      { id: 'serverAddress', numeric: false, disablePadding: false, label: 'Public address' },
      { id: 'currentUsers', numeric: true, disablePadding: false, label: 'Current # of Users' },
      { id: 'locationId', numeric: false, disablePadding: false, label: 'Location ID' },
      { id: 'action', numeric: false, disablePadding: false, label: 'Action' }
    ]
  }

  const openModalCreate = () => {
    setInstanceCreateOpen(true)
  }

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
    numSelected: number
    onRequestSort: (event: React.MouseEvent<unknown>, property) => void
    order: Order
    orderBy: string
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props
    const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

    return (
      <TableHead className={styles.thead}>
        <TableRow className={styles.trow}>
          {headCells.instances.map((headCell) => (
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

  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('name')
  const [selected, setSelected] = React.useState<string[]>([])
  const [page, setPage] = React.useState(0)
  const [dense, setDense] = React.useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(ADMIN_PAGE_LIMIT)
  const [refetch, setRefetch] = React.useState(false)
  const [instanceEdit, setInstanceEdit] = React.useState(InstanceSeed)
  const [instanceEditing, setInstanceEditing] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [instanceId, setInstanceId] = React.useState('')
  const dispatch = useDispatch()
  const displayInstances = adminInstances.value.map((instance) => {
    return {
      id: instance.id,
      ipAddress: instance.ipAddress,
      currentUsers: instance.currentUsers,
      locationId: instance.locationId,
      gsId: instance.gameserver_subdomain_provision?.gs_id,
      serverAddress:
        instance.gameserver_subdomain_provision != null
          ? `https://${instance.gameserver_subdomain_provision.gs_number}.${globalThis.process.env['VITE_GAMESERVER_HOST']}`
          : ''
    }
  })
  const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleInstanceClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selected = adminInstances.value.find((instance) => instance.id.toString() === id)
    if (selected !== undefined) {
      setSelectedInstance(selected)
      setInstanceModalOpen(true)
    }
  }

  const handleInstanceUpdateClick = (id: string) => {
    const selected = adminInstances.value.find((instance) => instance.id.toString() === id)
    if (selected !== undefined) {
      setInstanceEdit(selected)
      setInstanceCreateOpen(true)
      setInstanceEditing(true)
    }
  }

  const handleInstanceClose = (e: any): void => {
    console.log('handleInstanceClosed')
    setInstanceModalOpen(false)
    setSelectedInstance(InstanceSeed)
  }

  const handleCreateInstanceClose = (e: any): void => {
    setInstanceCreateOpen(false)
    setInstanceEditing(false)
  }

  useEffect(() => {
    if (user?.id.value != null && (adminInstanceState.instances.updateNeeded.value === true || refetch === true)) {
      InstanceService.fetchAdminInstances()
    }
    setRefetch(false)
  }, [useAuthState(), adminInstanceState.instances.updateNeeded.value, refetch])

  const handleClickOpen = (instance: any) => {
    setInstanceId(instance)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setInstanceId('')
  }

  const deleteInstance = () => {
    dispatch(InstanceService.removeInstance((instanceId as any).id))
    setOpen(false)
    setInstanceId('')
  }

  return (
    <div>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search typeName="users" />
        </Grid>
        <Grid item xs={3}>
          <Button
            className={styles.createLocation}
            type="submit"
            variant="contained"
            color="primary"
            onClick={openModalCreate}
          >
            Create New Instance
          </Button>
        </Grid>
      </Grid>

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
            />

            <TableBody className={styles.thead}>
              {stableSort(displayInstances, getComparator(order, orderBy)).map((row, index) => {
                return (
                  <TableRow className={styles.trow} style={{ color: 'black !important' }} tabIndex={-1} key={row.id}>
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
                      {row.ipAddress}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.gsId}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.serverAddress}
                    </TableCell>
                    <TableCell
                      className={styles.tcellSelectable}
                      align="center"
                      onClick={(event) => handleInstanceClick(event, row.id.toString())}
                    >
                      <p className={styles.currentUser}>{row.currentUsers}</p>
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {row.locationId}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      <a href="#h" onClick={(event) => handleInstanceUpdateClick(row.id.toString())}>
                        {' '}
                        <Edit className="text-success" />{' '}
                      </a>
                      <a href="#h" onClick={() => handleClickOpen(row)}>
                        {' '}
                        <Delete className="text-danger" />{' '}
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <InstanceModal instance={selectedInstance} open={instanceModalOpen} handleClose={handleInstanceClose} />
        {/* 
        TODO: This import is missing?!
        <CreateInstance
          open={instanceCreateOpen}
          handleClose={handleCreateInstanceClose}
          editing={instanceEditing}
          instanceEdit={instanceEdit}
        /> 
        */}

        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{`Do You want to delete Instance with Ip Address of ${
            (instanceId as any).ipAddress
          }?`}</DialogTitle>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={deleteInstance} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  )
}

export default InstanceConsole
