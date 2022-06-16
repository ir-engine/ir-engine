import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Party } from '@xrengine/common/src/interfaces/Party'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { partyColumns, PartyData, PartyPropsTable } from '../../common/variables/party'
import { AdminPartyService, PARTY_PAGE_LIMIT, usePartyState } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'
import ViewParty from './ViewParty'

const PartyTable = ({ search }: PartyPropsTable) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PARTY_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [partyId, setPartyId] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('location')
  const [openViewParty, setOpenViewParty] = useState(false)
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

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  const submitRemoveParty = async () => {
    await AdminPartyService.removeParty(partyId)
    setPopConfirmOpen(false)
  }

  const handleOpenViewParty = (open: boolean, party: any) => {
    setPartyAdmin(party)
    setOpenViewParty(open)
  }

  const handleCloseViewParty = () => {
    setPartyAdmin(undefined)
    setOpenViewParty(false)
  }

  const createData = (el: Party, id: string, instance: any, location: any): PartyData => {
    return {
      el,
      id,
      instance,
      location,
      action: (
        <>
          <a href="#h" className={styles.actionStyle} onClick={() => handleOpenViewParty(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.index.view')}</span>
          </a>
          <a
            href="#h"
            className={styles.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setPartyName(instance)
              setPartyId(id)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.index.delete')}</span>
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
      el?.instance?.ipAddress || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>,
      el.location?.name || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
    )
  })

  return (
    <React.Fragment>
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
      <ConfirmModal
        open={popConfirmOpen}
        description={`${t('admin:components.party.confirmPartyDelete')} '${partyName}'?`}
        onClose={handleCloseModal}
        onSubmit={submitRemoveParty}
      />
      <ViewParty open={openViewParty} partyAdmin={partyAdmin} onClose={handleCloseViewParty} />
    </React.Fragment>
  )
}

export default PartyTable
