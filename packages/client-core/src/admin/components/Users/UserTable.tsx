import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { UserService } from '../../state/UserService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/state/AuthState'
import { useUserState } from '../../state/UserState'
import { USER_PAGE_LIMIT } from '../../state/UserState'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import ViewUser from './ViewUser'
import { useUserStyle, useUserStyles } from './styles'
import { userColumns, UserData, UserProps } from './Variables'

const UserTable = (props: UserProps) => {
  const classes = useUserStyle()
  const classx = useUserStyles()
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(USER_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [userId, setUserId] = React.useState('')
  const [viewModel, setViewModel] = React.useState(false)
  const [userAdmin, setUserAdmin] = React.useState('')
  const user = useAuthState().user
  const dispatch = useDispatch()
  const adminUserState = useUserState()
  const adminUsers = adminUserState.users.users
  const adminUserCount = adminUserState.users.total
  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    UserService.fetchUsersAsAdmin(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }
  React.useEffect(() => {
    const fetchData = async () => {
      await UserService.fetchUsersAsAdmin()
    }
    if (adminUserState.users.updateNeeded.value === true && user.id.value) fetchData()
  }, [adminUserState.users.updateNeeded.value, user])

  const openViewModel = (open: boolean, user: any) => (event: React.KeyboardEvent | React.MouseEvent) => {
    UserService.refetchSingleUserAdmin()
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setUserAdmin(user)
    setViewModel(open)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  const createData = (
    id: any,
    user: any,
    name: string,
    avatar: string,
    status: string,
    location: string,
    inviteCode: string,
    instanceId: string
  ): UserData => {
    return {
      id,
      user,
      name,
      avatar,
      status,
      location,
      inviteCode,
      instanceId,
      action: (
        <>
          <a href="#h" className={classes.actionStyle} onClick={openViewModel(true, user)}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setUserId(id)
            }}
          >
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }
  const rows = adminUsers.value.map((el) => {
    const loc = el.party?.id ? el.party.location : null
    const loca = loc ? (
      loc.name || <span className={classes.spanNone}>None</span>
    ) : (
      <span className={classes.spanNone}>None</span>
    )
    const ins = el.party?.id ? el.party.instance : null
    const inst = ins ? (
      ins.ipAddress || <span className={classes.spanNone}>None</span>
    ) : (
      <span className={classes.spanNone}>None</span>
    )

    return createData(
      el.id,
      el,
      el.name,
      el.avatarId || <span className={classes.spanNone}>None</span>,
      el.userRole || <span className={classes.spanNone}>None</span>,
      loca,
      el.inviteCode || <span className={classes.spanNone}>None</span>,
      inst
    )
  })

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {userColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classx.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {userColumns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        classes={{ root: classes.rootT }}
                        className={classx.tableCellBody}
                      >
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[USER_PAGE_LIMIT]}
        component="div"
        count={adminUserCount?.value || 12}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classx.tableFooter}
      />
      <Dialog
        open={popConfirmOpen}
        onClose={() => setPopConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle id="alert-dialog-title">Confirm to delete this user!</DialogTitle>
        <DialogActions>
          <Button onClick={() => setPopConfirmOpen(false)} className={classes.spanNone}>
            Cancel
          </Button>
          <Button
            className={classes.spanDange}
            onClick={async () => {
              await UserService.removeUserAdmin(userId)
              setPopConfirmOpen(false)
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {userAdmin && <ViewUser openView={viewModel} userAdmin={userAdmin} closeViewModel={closeViewModel} />}
    </div>
  )
}

export default UserTable
