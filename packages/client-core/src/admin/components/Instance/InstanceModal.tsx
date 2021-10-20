import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Modal from '@material-ui/core/Modal'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles, Theme } from '@material-ui/core/styles'
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useRef, useState } from 'react'
import { client } from '../../../feathers'
import styles from '../Admin.module.scss'
import { Instance } from '@standardcreative/common/src/interfaces/Instance'
import { User } from '@standardcreative/common/src/interfaces/User'
interface Props {
  open: boolean
  handleClose: any
  instance?: Instance
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2)
    }
  }
}))

const InstanceModal = (props: Props): any => {
  const { open, handleClose, instance } = props

  const router = useHistory()
  const classes = useStyles()
  const [openToast, setOpenToast] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const currentInstanceId = useRef(0)

  const [instanceUsers, setInstanceUsers] = useState<User[]>([])

  const getInstanceUsers = async () => {
    if (instance?.id != null && instance?.id !== 0 && currentInstanceId.current === instance.id) {
      const instanceUserResult = await client.service('user').find({
        query: {
          $limit: 1000,
          instanceId: instance.id
        }
      })
      setInstanceUsers(instanceUserResult.data)
      if (instanceUserResult.total === 0)
        setTimeout(() => {
          handleClose()
        }, 5000)
      else
        setTimeout(() => {
          getInstanceUsers()
        }, 2000)
    }
  }

  useEffect(() => {
    currentInstanceId.current = instance?.id || 0
    getInstanceUsers()
  }, [instance])

  type Order = 'asc' | 'desc'

  interface EnhancedTableProps {
    object: string
    order: Order
    orderBy: string
    rowCount: number
  }

  const headCells = [
    { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'instanceId', numeric: false, disablePadding: false, label: 'Instance ID' },
    { id: 'userRole', numeric: false, disablePadding: false, label: 'User Role' },
    { id: 'partyId', numeric: false, disablePadding: false, label: 'Party ID' }
  ]

  const redirectToInstance = async () => {
    try {
      const location = await client.service('location').get(instance?.locationId)
      const route = `/location/${location.slugifiedName}?instanceId=${instance?.id}`
      router.push(route)
    } catch (err) {
      console.log('Error redirecting to instance:')
      console.log(err)
      setMessage('Error redirecting to instannce!......' + err.message)
      setOpenToast(true)
    }
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy } = props

    return (
      <TableHead className={styles.thead}>
        <TableRow className={styles.trow}>
          {headCells.map((headCell) => (
            <TableCell
              className={styles.tcell}
              key={headCell.id}
              align="right"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'}>
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
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            <div className={styles.instanceUsersHeader}>
              {/* <div>Users on instance {instance.id}</div> */}
              <Button variant="contained" color="primary" onClick={redirectToInstance}>
                Go to Instance
              </Button>
            </div>
            <TableContainer>
              <Table aria-labelledby="tableTitle" size="medium" aria-label="enhanced table">
                <EnhancedTableHead
                  object="users"
                  order={'asc'}
                  orderBy={'name'}
                  rowCount={instanceUsers?.length || 0}
                />
                <TableBody className={styles.thead}>
                  {instanceUsers != null &&
                    instanceUsers.map((row, index) => {
                      return (
                        <TableRow
                          className={styles.trow}
                          style={{ color: 'black !important' }}
                          // onClick={(event) => handleClick(event, row.id.toString())}
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
                            {row.instanceId}
                          </TableCell>
                          <TableCell className={styles.tcell} align="right">
                            {row.userRole}
                          </TableCell>
                          <TableCell className={styles.tcell} align="right">
                            {row.partyId}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {/*{emptyRows > 0 && (*/}
                  {/*    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>*/}
                  {/*        <TableCell colSpan={6} />*/}
                  {/*    </TableRow>*/}
                  {/*)}*/}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Fade>
      </Modal>
      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={() => setOpenToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setOpenToast(false)} severity="error">
          {message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default InstanceModal
