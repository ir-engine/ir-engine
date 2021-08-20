import React, { useEffect } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { retrieveReceivedInvites, retrieveSentInvites, sendInvite } from '../../../social/reducers/invite/service'
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles'
import { selectInviteState } from '../../../social/reducers/invite/selector'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Delete } from '@material-ui/icons'
import IconButton from '@material-ui/core/IconButton'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import TableFooter from '@material-ui/core/TableFooter'
import TablePagination from '@material-ui/core/TablePagination'

interface Props {
  receivedInvites?: any
  retrieveReceivedInvites?: any
  sendInvite?: any
  sentInvites?: any
  invites: any
}

const mapStateToProps = (state: any): any => {
  return {
    receivedInvites: selectInviteState(state),
    sentInvites: selectInviteState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  retrieveReceivedInvites: bindActionCreators(retrieveReceivedInvites, dispatch),
  sendInvite: bindActionCreators(sendInvite, dispatch),
  retrieveSentInvites: bindActionCreators(retrieveSentInvites, dispatch)
})

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
})

function createData(id: string, name: string, userRole: string, passcode: string, type: string) {
  return { id, name, userRole, passcode, type }
}

const useStyles1 = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5)
    }
  })
)

interface TablePaginationActionsProps {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const classes = useStyles1()
  const theme = useTheme()
  const { count, page, rowsPerPage, onPageChange } = props

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0)
  }

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1)
  }

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1)
  }

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
  }

  return (
    <div className={classes.root}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  )
}

const RecievedInvite = (props: Props) => {
  const classes = useStyles()
  const { invites } = props
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const rows = invites.map((el, index) => createData(el.id, el.user.name, el.user.userRole, el.passcode, el.inviteType))

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id </TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">User role</TableCell>
            <TableCell align="right">Passcode</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0 ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows).map(
            (row, index) => (
              <TableRow key={`index_${index}`}>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="right">{row.name}</TableCell>
                <TableCell align="right">{row.userRole}</TableCell>
                <TableCell align="right">{row.passcode}</TableCell>
                <TableCell align="right">{row.type}</TableCell>
                <TableCell align="right">
                  <Delete className="text-danger" />{' '}
                </TableCell>
              </TableRow>
            )
          )}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true
              }}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(RecievedInvite)
