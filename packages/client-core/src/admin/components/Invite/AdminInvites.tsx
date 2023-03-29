import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { InviteInterface } from '@etherealengine/common/src/interfaces/Invite'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Checkbox from '@etherealengine/ui/src/Checkbox'

import { INVITE_PAGE_LIMIT } from '../../../social/services/InviteService'
import TableComponent from '../../common/Table'
import { InviteColumn, inviteColumns } from '../../common/variables/invite'
import { AdminInviteService, AdminInviteState } from '../../services/InviteService'
import styles from '../../styles/admin.module.scss'
import UpdateInviteModal from './UpdateInviteModal'

interface Props {
  search: string
  selectedInviteIds: Set<string>
  setSelectedInviteIds: any
}

const defaultInvite = {
  id: '',
  passcode: '',
  inviteType: 'new-user',
  makeAdmin: false,
  deleteOnUse: true,
  createdAt: new Date().toJSON(),
  updatedAt: new Date().toJSON(),
  userId: ''
}

const AdminInvites = ({ search, selectedInviteIds, setSelectedInviteIds }: Props) => {
  const page = useHookstate(0)
  const openConfirm = useHookstate(false)
  const inviteId = useHookstate('')
  const selectedInvite = useHookstate(defaultInvite)
  const rowsPerPage = useHookstate(INVITE_PAGE_LIMIT)
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('id')
  const updateModalOpen = useHookstate(false)
  const inviteState = useHookstate(getMutableState(AdminInviteState))
  const { t } = useTranslation()
  const invites = inviteState.invites.get({ noproxy: true })
  const inviteCount = inviteState.total.value

  const deleteInvite = () => {
    AdminInviteService.removeInvite(inviteId.value)
    openConfirm.set(false)
  }

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    const incDec = page.value < newPage ? 'increment' : 'decrement'
    AdminInviteService.fetchAdminInvites(incDec, search, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (inviteState.updateNeeded.value === true)
      AdminInviteService.fetchAdminInvites(undefined, search, sortField.value, fieldOrder.value)
  }, [search, inviteState.updateNeeded.value, sortField.value, fieldOrder.value])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    rowsPerPage.set(parseInt(event.target.value, 10))
    page.set(0)
  }

  const toggleSelection = (id: string) => {
    if (selectedInviteIds.has(id)) {
      setSelectedInviteIds((current) => {
        const newSet = new Set(current)
        newSet.delete(id)
        return newSet
      })
    } else {
      setSelectedInviteIds((current) => new Set(current).add(id))
    }
  }

  const createData = (invite: InviteInterface) => {
    return {
      select: (
        <>
          <Checkbox
            className={styles.checkbox}
            checked={selectedInviteIds.has(invite.id)}
            onChange={() => {
              toggleSelection(invite.id)
            }}
          />
        </>
      ),
      id: invite.id,
      name: invite.invitee?.name || invite.token || '',
      passcode: invite.passcode,
      type: invite.inviteType,
      targetObjectId: invite.targetObjectId,
      spawnType: invite.spawnType,
      spawnDetails: invite.spawnDetails,
      action: (
        <>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              selectedInvite.set(invite)
              updateModalOpen.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.update')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              inviteId.set(invite.id)
              openConfirm.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = invites.map((el) => createData(el))

  let allSelected: boolean | undefined = undefined
  if (invites.length === selectedInviteIds.size) {
    allSelected = true
  } else if (selectedInviteIds.size === 0) {
    allSelected = false
  }

  const columns: InviteColumn[] = [
    {
      id: 'select',
      label: (
        <Checkbox
          className={styles.checkbox}
          checked={allSelected === true}
          indeterminate={allSelected === undefined}
          onChange={(_event, checked) => {
            if (checked || allSelected === undefined) {
              const set = new Set<string>()
              invites.map((item) => set.add(item.id))
              setSelectedInviteIds(set)
            } else {
              setSelectedInviteIds(new Set<string>())
            }
          }}
        />
      ),
      minWidth: 65
    },
    ...inviteColumns
  ]

  return (
    <React.Fragment>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        fieldOrderBy="id"
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={columns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={inviteCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <UpdateInviteModal
        open={updateModalOpen.value}
        onClose={() => {
          updateModalOpen.set(false)
          selectedInvite.set(defaultInvite)
        }}
        invite={selectedInvite.get({ noproxy: true })}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.invite.confirmInviteDelete')} '${inviteId.set}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={deleteInvite}
      />
    </React.Fragment>
  )
}

export default AdminInvites
