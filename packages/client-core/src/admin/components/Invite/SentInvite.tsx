import { useConfirm } from 'material-ui-confirm'
import React from 'react'

import { Delete } from '@mui/icons-material'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableFooter from '@mui/material/TableFooter'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { Theme, useTheme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import { InviteService } from '../../../social/services/InviteService'
import { useInviteState } from '../../../social/services/InviteService'
import { INVITE_PAGE_LIMIT } from '../../../social/services/InviteService'
import { useDispatch } from '../../../store'

interface Props {
  sentInvites?: any

  invites: any
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
    background: '#43484F !important'
  },
  TableCellColor: {
    color: '#f1f1f1'
  }
})

function createData(id: string, name: string, passcode: string, type: string) {
  return { id, name, passcode, type }
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
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page" size="large">
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page" size="large">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        size="large"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
        size="large"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  )
}

const SentInvite = (props: Props) => {
  const classes = useStyles()
  const confirm = useConfirm()
  const { invites } = props
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(INVITE_PAGE_LIMIT)
  const dispatch = useDispatch()
  const inviteState = useInviteState()
  const sentInviteCount = inviteState.sentInvites.total.value
  const rows = invites.map((el, index) =>
    createData(el.id, el.invitee ? el.invitee.name : '', el.passcode, el.inviteType)
  )
  const deleteInvite = (invite) => {
    confirm({ description: `This will permanently delete ${invite.token}.` })
      .then(() => InviteService.removeInvite(invite))
      .catch(() => console.error('error'))
  }

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    InviteService.retrieveSentInvites(incDec)
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
            <TableCell className={classes.TableCellColor}>Id</TableCell>
            <TableCell className={classes.TableCellColor} align="right">
              Name
            </TableCell>
            <TableCell className={classes.TableCellColor} align="right">
              Passcode
            </TableCell>
            <TableCell className={classes.TableCellColor} align="right">
              Type
            </TableCell>
            <TableCell className={classes.TableCellColor} align="right">
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`index_${index}`}>
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell align="right">{row.name}</TableCell>
              <TableCell align="right">{row.passcode}</TableCell>
              <TableCell align="right">{row.type}</TableCell>
              <TableCell align="right">
                <a href="#h" onClick={() => deleteInvite(row)}>
                  {' '}
                  <Delete className="text-danger" />{' '}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[INVITE_PAGE_LIMIT]}
              component="div"
              colSpan={3}
              count={sentInviteCount}
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

export default SentInvite
