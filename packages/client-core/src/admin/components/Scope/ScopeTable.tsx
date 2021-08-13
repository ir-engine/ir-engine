import React from 'react'
import { getScopeService, removeScope } from '../../reducers/admin/scope/service'
import { selectScopeState } from '../../reducers/admin/scope/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { bindActionCreators, Dispatch } from 'redux'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import { TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@material-ui/core'
import { useStyles, useStyle } from './styles'
import { columns, Data } from './Variables'
import ViewScope from './ViewScope'

interface Props {
  getScopeService?: () => void
  adminScopeState?: any
  authState?: any
  deleteScope?: any
}

const mapStateToProps = (state: any): any => ({
  adminScopeState: selectScopeState(state),
  authState: selectAuthState(state)
})

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getScopeService: bindActionCreators(getScopeService, dispatch),
  deleteScope: bindActionCreators(removeScope, dispatch)
})

const ScopeTable = (props: Props) => {
  const { getScopeService, adminScopeState, authState, deleteScope } = props
  const classes = useStyles()
  const classx = useStyle()

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(12)
  const user = authState.get('user')
  const adminScopes = adminScopeState.get('scope').get('scope')
  const [adminScope, setAdminScope] = React.useState('')
  const [open, setOpen] = React.useState(false)  
  const [showWarning, setShowWarning] = React.useState(false)
  const [scopeId, setScopeId] = React.useState('')


  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewScope = (id: string) => {
    const scope = adminScopes.find((el) => el.id === id)
    setAdminScope(scope)
    setOpen(true)
  }

  const handleClose = (open: boolean) => {
    setOpen(open)
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }
  const handleShowWarning = (id: string) => {
    setScopeId(id)
    setShowWarning(true)
  }

  const deleteScopeHandler = () => {
    setShowWarning(false)
    deleteScope(scopeId)
    setScopeId('')
  }

  React.useEffect(() => {
    const fetchData = async () => {
      await getScopeService()
    }
    if (adminScopeState.get('scope').get('updateNeeded') && user.id) fetchData()
  }, [adminScopeState, user])

  const createData = (id: any, name: any, group: string, user: string): Data => {
    return {
      id,
      name,
      group,
      user,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite} onClick={ () => handleViewScope(id) } >View</span>
          </a>
          <a href="#h" className={classes.actionStyle} onClick={ () => handleShowWarning(id) } >
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = adminScopes.map((el) => {
    return createData(el.id, el.scopeName, el.group.name, el.user.name)
  })

  const count = rows.size ? rows.size : rows.length

  return (
    <div className={classx.root}>
      <TableContainer className={classx.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classes.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={data.id}>
                  {columns.map((column) => {
                    const value = data[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classes.tableCellBody}>
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
        rowsPerPageOptions={[12]}
        component="div"
        count={count || 12}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classes.tableFooter}
      />
       <Dialog
        open={showWarning}
        onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={classes.alert} id="alert-dialog-title">
          {'Confirm to delete this scope!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting scope can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleCloseWarning} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={deleteScopeHandler} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {adminScope && <ViewScope adminScope={adminScope} viewModal={open} closeViewModal={handleClose} />}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ScopeTable)
