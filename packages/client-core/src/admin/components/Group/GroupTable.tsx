import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import { useDispatch } from '../../../store'
import { useGroupState } from '../../state/GroupService'
import { GroupService } from '../../state/GroupService'
import { useAuthState } from '../../../user/state/AuthService'
import { columns, Data } from './Variables'
import { useGroupStyles, useGroupStyle } from './styles'
import ViewGroup from './ViewGroup'
import { GROUP_PAGE_LIMIT } from '../../state/GroupService'

interface Props {}

const GroupTable = (props: Props) => {
  const dispatch = useDispatch()
  const classes = useGroupStyles()
  const classx = useGroupStyle()

  const user = useAuthState().user
  const [viewModel, setViewModel] = React.useState(false)
  const [singleGroup, setSingleGroup] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(GROUP_PAGE_LIMIT)
  const [groupId, setGroupId] = React.useState('')
  const [showWarning, setShowWarning] = React.useState(false)
  const adminGroupState = useGroupState()
  const adminGroups = adminGroupState.group.group
  const adminGroupCount = adminGroupState.group.total

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    GroupService.getGroupService(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewGroup = (id: string) => {
    const group = adminGroups.value.find((group) => group.id === id)
    if (group !== null) {
      setSingleGroup(group)
      setViewModel(true)
    }
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const handleShowWarning = (id: string) => {
    setGroupId(id)
    setShowWarning(true)
  }

  const deleteGroupHandler = () => {
    setShowWarning(false)
    GroupService.deleteGroupByAdmin(groupId)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  React.useEffect(() => {
    if (adminGroupState.group.updateNeeded.value) GroupService.getGroupService()
  }, [adminGroupState.group.updateNeeded.value, user])

  const createData = (id: any, name: any, description: string): Data => {
    return {
      id,
      name,
      description,
      action: (
        <>
          <a href="#h" className={classes.actionStyle} onClick={() => handleViewGroup(id)}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a href="#h" className={classes.actionStyle} onClick={() => handleShowWarning(id)}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = adminGroups.value.map((el) => {
    return createData(el.id, el.name, el.description)
  })

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
            {rows.map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((column) => {
                    const value = row[column.id]
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
        rowsPerPageOptions={[GROUP_PAGE_LIMIT]}
        component="div"
        count={adminGroupCount.value}
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
          {'Confirm to delete this group!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting group can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleCloseWarning} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={deleteGroupHandler} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {singleGroup && <ViewGroup groupAdmin={singleGroup} openView={viewModel} closeViewModal={closeViewModel} />}
    </div>
  )
}

export default GroupTable
