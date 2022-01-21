import React from 'react'
import { PartyService } from '../../services/PartyService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { PartyPropsTable, partyColumns, PartyData } from '../../common/variables/party'
import { useStyles } from '../../styles/ui'
import { usePartyState } from '../../services/PartyService'
import { PARTY_PAGE_LIMIT } from '../../services/PartyService'
import TableComponent from '../../common/Table'
import ConfirmModel from '../../common/ConfirmModel'
import { useFetchAdminParty } from '../../common/hooks/party.hooks'
import ViewParty from './ViewParty'

const PartyTable = (props: PartyPropsTable) => {
  const { search } = props
  const classes = useStyles()
  const dispatch = useDispatch()

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(PARTY_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [partyName, setPartyName] = React.useState('')
  const [partyId, setPartyId] = React.useState('')
  const [viewModel, setViewModel] = React.useState(false)
  const [partyAdmin, setPartyAdmin] = React.useState('')

  const authState = useAuthState()
  const user = authState.user
  const adminPartyState = usePartyState()
  const adminParty = adminPartyState
  const adminPartyData = adminParty.parties?.value || []
  const adminPartyCount = adminParty.total.value

  //Call custom hooks
  useFetchAdminParty(user, adminParty, adminPartyState, PartyService, search)

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    PartyService.fetchAdminParty(incDec)
    setPage(newPage)
  }

  const handleCloseModel = () => {
    setPopConfirmOpen(false)
  }

  const submitRemoveParty = async () => {
    await PartyService.removeParty(partyId)
    setPopConfirmOpen(false)
  }

  const openViewModel = (open: boolean, party: any) => {
    setPartyAdmin(party)
    setViewModel(open)
  }

  const closeViewModel = () => {
    setViewModel(false)
  }

  const createData = (el: any, id: string, instance: any, location: any): PartyData => {
    return {
      el,
      id,
      instance,
      location,
      action: (
        <>
          <a href="#h" className={classes.actionStyle} onClick={() => openViewModel(true, el)}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setPartyName(instance)
              setPartyId(id)
            }}
          >
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
      el,
      el.id,
      el?.instance?.ipAddress || <span className={classes.spanNone}>None</span>,
      el.location?.name || <span className={classes.spanNone}>None</span>
    )
  })

  return (
    <React.Fragment>
      <TableComponent
        rows={rows}
        column={partyColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminPartyCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModel
        popConfirmOpen={popConfirmOpen}
        handleCloseModel={handleCloseModel}
        submit={submitRemoveParty}
        name={partyName}
        label={'party with instance of '}
      />
      <ViewParty openView={viewModel} closeViewModel={closeViewModel} partyAdmin={partyAdmin} />
    </React.Fragment>
  )
}

export default PartyTable
