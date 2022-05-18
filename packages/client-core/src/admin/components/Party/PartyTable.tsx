import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Party } from '@xrengine/common/src/interfaces/Party'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import { useFetchAdminParty } from '../../common/hooks/party.hooks'
import TableComponent from '../../common/Table'
import { partyColumns, PartyData, PartyPropsTable } from '../../common/variables/party'
import { PARTY_PAGE_LIMIT, PartyService, usePartyState } from '../../services/PartyService'
import styles from '../../styles/admin.module.scss'
import ViewParty from './ViewParty'

const PartyTable = (props: PartyPropsTable) => {
  const { search } = props
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PARTY_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [partyId, setPartyId] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('location')
  const [viewModal, setViewModal] = useState(false)
  const [partyAdmin, setPartyAdmin] = useState<Party>()
  const [editMode, setEditMode] = useState(false)

  const authState = useAuthState()
  const user = authState.user
  const adminPartyState = usePartyState()
  const adminParty = adminPartyState
  const adminPartyData = adminParty.parties?.value || []
  const adminPartyCount = adminParty.total.value

  //Call custom hooks
  useFetchAdminParty(user, adminPartyState, PartyService, search, page, sortField, fieldOrder)

  const handlePageChange = (event: unknown, newPage: number) => {
    PartyService.fetchAdminParty(search, page, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminParty.fetched.value) {
      PartyService.fetchAdminParty(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  const submitRemoveParty = async () => {
    await PartyService.removeParty(partyId)
    setPopConfirmOpen(false)
  }

  const openViewModal = (open: boolean, party: any) => {
    setPartyAdmin(party)
    setViewModal(open)
  }

  const closeViewModal = () => {
    setViewModal(false)
    setPartyAdmin(undefined)
    setEditMode(false)
  }

  const handleEditMode = (open: boolean) => {
    setEditMode(open)
  }

  const createData = (el: Party, id: string, instance: any, location: any): PartyData => {
    return {
      el,
      id,
      instance,
      location,
      action: (
        <>
          <a href="#h" className={styles.actionStyle} onClick={() => openViewModal(true, el)}>
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
        popConfirmOpen={popConfirmOpen}
        handleCloseModal={handleCloseModal}
        submit={submitRemoveParty}
        name={partyName}
        label={t('admin:components.party.partyWithInstanceOf') as string}
      />
      <ViewParty
        openView={viewModal}
        closeViewModal={closeViewModal}
        partyAdmin={partyAdmin}
        editMode={editMode}
        handleEditMode={handleEditMode}
      />
    </React.Fragment>
  )
}

export default PartyTable
