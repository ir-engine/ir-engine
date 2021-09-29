import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import { fetchAdminParty } from '../../reducers/admin/party/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useAuthState } from '../../../user/reducers/auth/AuthState'
import { PartyPropsTable, partyColumns, PartyData } from './variables'
import { usePartyStyles, usePartyStyle } from './style'
import { selectAdminPartyState } from '../../reducers/admin/party/selector'
import { PARTY_PAGE_LIMIT } from '../../reducers/admin/party/reducers'

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminParty: bindActionCreators(fetchAdminParty, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    adminPartyState: selectAdminPartyState(state)
  }
}

const PartyTable = (props: PartyPropsTable) => {
  const classes = usePartyStyle()
  const classex = usePartyStyles()
  const { fetchAdminParty, adminPartyState } = props

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(PARTY_PAGE_LIMIT)

  const authState = useAuthState()
  const user = authState.user
  const adminParty = adminPartyState.get('parties')
  const adminPartyData = adminParty.get('parties').data ? adminParty.get('parties').data : []
  const adminPartyCount = adminParty.get('total')

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    fetchAdminParty(incDec)
    setPage(newPage)
  }

  React.useEffect(() => {
    if (user?.id?.value && adminParty.get('updateNeeded') === true) {
      fetchAdminParty()
    }
  }, [authState.user?.id?.value, adminPartyState])

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

  const rows = adminPartyData.map((el) =>
    createData(
      el.id,
      el.instance?.ipAddress || <span className={classes.spanNone}>None</span>,
      el.location?.name || <span className={classes.spanNone}>None</span>
    )
  )

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
        count={adminPartyCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classex.tableFooter}
      />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(PartyTable)
