import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { avatarColumns, AvatarData } from '../../common/variables/avatar'
import { AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import { useAvatarState } from '../../services/AvatarService'
import { AvatarService } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'
import ViewAvatar from './ViewAvatar'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  // locationState?: any
  search: string
}

const AvatarTable = (props: Props) => {
  const adminAvatarState = useAvatarState()
  const { search } = props
  const authState = useAuthState()
  const user = authState.user
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(AVATAR_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [avatarId, setAvatarId] = useState('')
  const [avatarName, setAvatarName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [viewModal, setViewModal] = useState(false)
  const [avatarAdmin, setAvatarAdmin] = useState<AvatarInterface | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    AvatarService.fetchAdminAvatars(newPage, search, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminAvatarState.fetched.value) {
      AvatarService.fetchAdminAvatars(page, search, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    AvatarService.fetchAdminAvatars(0, search, sortField, fieldOrder)
  }, [user?.id?.value, search, adminAvatarState.updateNeeded.value])

  const createData = (
    el: AvatarInterface,
    sid: string | undefined,
    name: string | undefined,
    key: string | undefined
  ): AvatarData => {
    return {
      el,
      sid,
      name,
      key,
      action: (
        <>
          <a
            href="#h"
            className={styles.actionStyle}
            onClick={() => {
              setAvatarAdmin(el)
              setViewModal(true)
            }}
          >
            <span className={styles.spanWhite}>{t('user:avatar.view')}</span>
          </a>
          <a
            href="#h"
            className={styles.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setAvatarId(el.id)
              setAvatarName(name as any)
            }}
          >
            <span className={styles.spanDange}>{t('user:avatar.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = adminAvatars.value.map((el) => {
    return createData(el, el.sid, el.name, el.key)
  })

  const submitRemoveAvatar = async () => {
    await AvatarService.removeAdminAvatar(avatarId)
    setPopConfirmOpen(false)
  }

  const closeViewModal = (open: boolean) => {
    setViewModal(open)
  }

  return (
    <React.Fragment>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder}
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={avatarColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminAvatarCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      {/* {avatarSelectMenuOpen && (
          <AvatarSelectMenu changeActiveMenu={() => setAvatarSelectMenuOpen(false)} isPublicAvatar={true} />
        )} */}

      <ConfirmModal
        popConfirmOpen={popConfirmOpen}
        handleCloseModal={handleCloseModal}
        submit={submitRemoveAvatar}
        name={avatarName}
        label={'avatar'}
      />
      {avatarAdmin && viewModal && (
        <ViewAvatar openView={viewModal} avatarData={avatarAdmin} closeViewModal={closeViewModal} />
      )}
    </React.Fragment>
  )
}

export default AvatarTable
