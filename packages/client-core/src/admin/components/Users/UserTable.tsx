import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import { removeUserAdmin, fetchUsersAsAdmin, refetchSingleUserAdmin } from '../../reducers/admin/user/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectAdminUserState } from '../../reducers/admin/user/selector'
import { USER_PAGE_LIMIT } from '../../reducers/admin/user/reducers'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import ViewUser from './ViewUser'
import { useUserStyle, useUserStyles } from './styles'
import { userColumns, UserData, UserProps } from './Variables'

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    adminUserState: selectAdminUserState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  removeUserAdmin: bindActionCreators(removeUserAdmin, dispatch),
  fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
  refetchSingleUserAdmin: bindActionCreators(refetchSingleUserAdmin, dispatch)
})

const UserTable = (props: UserProps) => {
  const { removeUserAdmin, refetchSingleUserAdmin, fetchUsersAsAdmin, authState, adminUserState } = props
  const classes = useUserStyle()
  const classx = useUserStyles()
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(USER_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [userId, setUserId] = React.useState('')
  const [viewModel, setViewModel] = React.useState(false)
  const [userAdmin, setUserAdmin] = React.useState('')
  const user = authState.get('user')
  const adminUsers = adminUserState.get('users').get('users')
  const adminUserCount = adminUserState.get('users').get('total')
  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    fetchUsersAsAdmin(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }
  React.useEffect(() => {
    const fetchData = async () => {
      await fetchUsersAsAdmin()
    }
    if (adminUserState.get('users').get('updateNeeded') === true && user.id) fetchData()
  }, [adminUserState, user, fetchUsersAsAdmin])

  const openViewModel = (open: boolean, user: any) => (event: React.KeyboardEvent | React.MouseEvent) => {
    refetchSingleUserAdmin()
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
  const rows = adminUsers.map((el) => {
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
                      <TableCell key={column.id} align={column.align} className={classx.tableCellBody}>
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
        count={adminUserCount || 12}
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
              await removeUserAdmin(userId)
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

export default connect(mapStateToProps, mapDispatchToProps)(UserTable)
