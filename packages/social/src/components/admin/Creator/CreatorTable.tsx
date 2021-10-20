import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { useCreatorStyles, useCreatorStyle } from './styles'
import { creatorColumns, CreatorData } from './Variables'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { useDispatch } from '@xrengine/client-core/src/store'
import TablePagination from '@material-ui/core/TablePagination'
import ViewCreator from './ViewCreator'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useCreatorState } from '@xrengine/client-core/src/social/state/CreatorState'

interface Props {}

const CreatorTable = (props: Props) => {
  const classx = useCreatorStyles()
  const classes = useCreatorStyle()
  const user = useAuthState().user
  const creatorState = useCreatorState()
  const creator = creatorState.creators
  const creatorData = creator.creators
  const [singleCreator, setSingleCreator] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)
  const [creatorId, setCreatorId] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(12)
  const dispatch = useDispatch()
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleClose = (open: boolean) => {
    setOpen(open)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const deleteCreatorHandler = () => {
    setShowWarning(false)
    CreatorService.deleteCreator(creatorId)
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const handleShowWarning = (id: string) => {
    setCreatorId(id)
    setShowWarning(true)
  }

  const handleViewCreator = (id: string) => {
    const creator = creatorData.value.find((creator) => creator.id === id)
    setSingleCreator({ ...creator })
    setOpen(true)
  }

  React.useEffect(() => {
    if (user.id.value && creator.updateNeeded.value) {
      CreatorService.fetchCreatorAsAdmin()
    }
  }, [user, creator])

  const createData = (
    id: string,
    name: string,
    username: string,
    email: string,
    link: string,
    description: any,
    avatarId: string,
    socialMedia: string
  ): CreatorData => {
    return {
      id,
      name,
      username,
      email,
      link,
      description,
      avatarId,
      socialMedia,
      action: (
        <>
          <a href="#h" className={classes.actionStyle} onClick={() => handleViewCreator(id)}>
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

  const rows = creatorData.value.map((el) => {
    return createData(
      el.id,
      el.name || <span className={classes.spanNone}>None</span>,
      el.username || <span className={classes.spanNone}>None</span>,
      el.email || <span className={classes.spanNone}>None</span>,
      el.link || <span className={classes.spanNone}>None</span>,
      el.bio || <span className={classes.spanNone}>None</span>,
      el.avatarId || <span className={classes.spanNone}>None</span>,
      el.twitter || <span className={classes.spanNone}>None</span>
    )
  })

  const count = rows.length

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {creatorColumns.map((column) => (
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
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {creatorColumns.map((column) => {
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
        rowsPerPageOptions={[12]}
        component="div"
        count={count || 12}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classx.tableFooter}
      />
      <Dialog
        open={showWarning}
        onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={classes.alert} id="alert-dialog-title">
          {'Confirm to delete this creator!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting creator can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleCloseWarning} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={deleteCreatorHandler} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {singleCreator && <ViewCreator adminCreator={singleCreator} viewModal={open} closeViewModal={handleClose} />}
    </div>
  )
}

export default CreatorTable
