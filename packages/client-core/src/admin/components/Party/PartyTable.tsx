import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Party } from '@xrengine/common/src/interfaces/Party'

import Box from '@mui/material/Box'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { partyColumns, PartyData, PartyPropsTable } from '../../common/variables/party'
import { AdminPartyService, PARTY_PAGE_LIMIT, usePartyState } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'
import PartyDrawer, { PartyDrawerMode } from './PartyDrawer'

const PartyTable = ({ className, search }: PartyPropsTable) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PARTY_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [partyId, setPartyId] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('maxMembers')
  const [openPartyDrawer, setOpenPartyDrawer] = useState(false)
  const [partyAdmin, setPartyAdmin] = useState<Party>()

  const authState = useAuthState()
  const user = authState.user
  const adminPartyState = usePartyState()
  const adminParty = adminPartyState
  const adminPartyData = adminParty.parties?.value || []
  const adminPartyCount = adminParty.total.value

  useEffect(() => {
    AdminPartyService.fetchAdminParty(search, page, sortField, fieldOrder)
  }, [user?.id?.value, adminPartyState.updateNeeded.value, search])

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminPartyService.fetchAdminParty(search, page, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminParty.fetched.value) {
      AdminPartyService.fetchAdminParty(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const submitRemoveParty = async () => {
    await AdminPartyService.removeParty(partyId)
    setOpenConfirm(false)
  }

  const handleOpenPartyDrawer = (open: boolean, party: any) => {
    setPartyAdmin(party)
    setOpenPartyDrawer(open)
  }

  const handleClosePartyDrawer = () => {
    setPartyAdmin(undefined)
    setOpenPartyDrawer(false)
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
              setPartyId(id)
              setOpenConfirm(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
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
        fieldOrder={fieldOrder}
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={partyColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminPartyCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.party.confirmPartyDelete')}`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveParty}
      />
      <PartyDrawer
        open={openPartyDrawer}
        mode={PartyDrawerMode.ViewEdit}
        selectedParty={partyAdmin}
        onClose={handleClosePartyDrawer}
      />
    </Box>
  )
}

export default PartyTable
