/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Party } from '@etherealengine/common/src/interfaces/Party'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'

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
          <a className={styles.actionStyle} onClick={() => handleOpenPartyDrawer(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
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
