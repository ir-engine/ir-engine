import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { PartyService } from '../../state/PartyService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/state/AuthService'
import { PartyPropsTable, partyColumns, PartyData } from './variables'
import { usePartyStyles, usePartyStyle } from './style'
import { usePartyState } from '../../state/PartyService'
import { PARTY_PAGE_LIMIT } from '../../state/PartyService'

const PartyTable = (props: PartyPropsTable) => {
  const classes = usePartyStyle()
  const classex = usePartyStyles()
  const dispatch = useDispatch()

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(PARTY_PAGE_LIMIT)

  const authState = useAuthState()
  const user = authState.user
  const adminPartyState = usePartyState()
  const adminParty = adminPartyState.parties
  const adminPartyData = adminParty.parties?.value || []
  const adminPartyCount = adminParty.total

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    PartyService.fetchAdminParty(incDec)
    setPage(newPage)
  }

  React.useEffect(() => {
    if (user?.id?.value && adminParty.updateNeeded.value === true) {
      PartyService.fetchAdminParty()
    }
  }, [authState.user?.id?.value, adminPartyState.parties.updateNeeded.value])

  const createData = (id: string, instance: string, location: string): PartyData => {
    return {
      id,
      instance,
      location,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            {' '}
            <span className={classes.spanWhite}>View</span>{' '}
          </a>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanDange}>Delete</span>
          </a>
        </>
      )
    }
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const rows = adminPartyData?.map((el) => {
    return createData(
      el.id,
      el?.instance?.ipAddress || `<span className={classes.spanNone}>None</span>`,
      el.location?.name || `<span className={classes.spanNone}>None</span>`
    )
  })

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {partyColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classex.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {partyColumns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classex.tableCellBody}>
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
        rowsPerPageOptions={[PARTY_PAGE_LIMIT]}
        component="div"
        count={adminPartyCount.value}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classex.tableFooter}
      />
    </div>
  )
}

export default PartyTable
