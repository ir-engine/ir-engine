import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Party } from '@etherealengine/common/src/interfaces/Party'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { partyColumns, PartyData, PartyPropsTable } from '../../common/variables/party'
import { AdminPartyService, AdminPartyState, PARTY_PAGE_LIMIT } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'
import PartyDrawer, { PartyDrawerMode } from './PartyDrawer'

const PartyTable = ({ className, search }: PartyPropsTable) => {
  const { t } = useTranslation()
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(PARTY_PAGE_LIMIT)
  const openConfirm = useHookstate(false)
  const partyId = useHookstate('')
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('maxMembers')
  const openPartyDrawer = useHookstate(false)
  const partyAdmin = useHookstate<Party | undefined>(undefined)

  const user = useHookstate(getMutableState(AuthState).user)
  const adminPartyState = useHookstate(getMutableState(AdminPartyState))
  const adminPartyData = adminPartyState.parties?.get({ noproxy: true }) || []
  const adminPartyCount = adminPartyState.total.value

  useEffect(() => {
    AdminPartyService.fetchAdminParty(search, page.value, sortField.value, fieldOrder.value)
  }, [user?.id?.value, adminPartyState.updateNeeded.value, search])

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminPartyService.fetchAdminParty(search, page.value, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminPartyState.fetched.value) {
      AdminPartyService.fetchAdminParty(search, page.value, sortField.value, fieldOrder.value)
    }
  }, [fieldOrder.value])

  const submitRemoveParty = async () => {
    await AdminPartyService.removeParty(partyId.value)
    openConfirm.set(false)
  }

  const handleOpenPartyDrawer = (open: boolean, party: any) => {
    partyAdmin.set(party)
    openPartyDrawer.set(open)
  }

  const handleClosePartyDrawer = () => {
    partyAdmin.set(undefined)
    openPartyDrawer.set(false)
  }

  const createData = (el: Party, id: string, maxMembers: any): PartyData => {
    return {
      el,
      id,
      maxMembers,
      action: (
        <>
          <a href="#" className={styles.actionStyle} onClick={() => handleOpenPartyDrawer(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              partyId.set(id)
              openConfirm.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  const rows = adminPartyData?.map((el: Party) => {
    return createData(
      el,
      el.id!,
      el.maxMembers || <span className={styles.spanNone}>{t('admin:components.common.none')}</span>
    )
  })

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={partyColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminPartyCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.party.confirmPartyDelete')}`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveParty}
      />
      <PartyDrawer
        open={openPartyDrawer.value}
        mode={PartyDrawerMode.ViewEdit}
        selectedParty={partyAdmin.value}
        onClose={handleClosePartyDrawer}
      />
    </Box>
  )
}

export default PartyTable
