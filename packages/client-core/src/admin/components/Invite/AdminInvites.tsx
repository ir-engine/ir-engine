import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InviteInterface } from '@xrengine/common/src/interfaces/Invite'

import Checkbox from '@mui/material/Checkbox'

import { INVITE_PAGE_LIMIT } from '../../../social/services/InviteService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { InviteColumn, inviteColumns } from '../../common/variables/invite'
import { AdminInviteService, useAdminInviteState } from '../../services/InviteService'
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
  const [page, setPage] = useState(0)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [inviteId, setInviteId] = useState('')
  const [selectedInvite, _setSelectedInvite] = useState(defaultInvite)
  const [rowsPerPage, setRowsPerPage] = useState(INVITE_PAGE_LIMIT)
  const inviteState = useAdminInviteState()
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('id')
  const { t } = useTranslation()
  const invites = inviteState.invites
  const inviteCount = inviteState.total.value
  const [updateModalOpen, setUpdateModalOpen] = useState(false)

  const selectedInviteRef = useRef(selectedInvite)

  const setSelectedInvite = (invite) => {
    selectedInviteRef.current = invite
    _setSelectedInvite(invite)
  }

  const deleteInvite = () => {
    AdminInviteService.removeInvite(inviteId)
    setOpenConfirm(false)
  }

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    AdminInviteService.fetchAdminInvites(incDec, search, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (inviteState.updateNeeded.value === true)
      AdminInviteService.fetchAdminInvites(undefined, search, sortField, fieldOrder)
  }, [search, inviteState.updateNeeded.value, sortField, fieldOrder])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
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
              setSelectedInvite({ ...invite })
              setUpdateModalOpen(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.update')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setInviteId(invite.id)
              setOpenConfirm(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = invites.value.map((el) => createData(el))

  let allSelected: boolean | undefined = undefined
  if (invites.value.length === selectedInviteIds.size) {
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
              invites.value.map((item) => set.add(item.id))
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
        fieldOrder={fieldOrder}
        fieldOrderBy="id"
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={inviteCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <UpdateInviteModal
        open={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false)
          setSelectedInvite(defaultInvite)
        }}
        invite={selectedInviteRef.current}
      />
      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.invite.confirmInviteDelete')} '${inviteId}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={deleteInvite}
      />
    </React.Fragment>
  )
}

export default AdminInvites
