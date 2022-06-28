import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { dispatchAction } from '@xrengine/hyperflux'

import Box from '@mui/material/Box'

import AvatarSelectMenu from '../../../user/components/UserMenu/menus/AvatarSelectMenu'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import DrawerView from '../../common/DrawerView'
import TableComponent from '../../common/Table'
import { avatarColumns, AvatarData } from '../../common/variables/avatar'
import { AdminAvatarActions, AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import { useAdminAvatarState } from '../../services/AvatarService'
import { AdminAvatarService } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'

interface Props {
  className?: string
  search: string
}

const AvatarTable = ({ className, search }: Props) => {
  const adminAvatarState = useAdminAvatarState()
  const authState = useAuthState()
  const user = authState.user
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total
  const { t } = useTranslation()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(AVATAR_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [avatarId, setAvatarId] = useState('')
  const [avatarName, setAvatarName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [openDrawer, setOpenDrawer] = useState(false)
  const [avatarData, setViewAvatarData] = useState<AvatarInterface | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminAvatarService.fetchAdminAvatars(newPage, search, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminAvatarState.fetched.value) {
      AdminAvatarService.fetchAdminAvatars(page, search, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    AdminAvatarService.fetchAdminAvatars(0, search, sortField, fieldOrder)
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
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setViewAvatarData(el)
              setOpenDrawer(true)
            }}
          >
            <span className={styles.spanWhite}>{t('user:avatar.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setAvatarId(el.id)
              setAvatarName(name as any)
              setOpenConfirm(true)
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
    await AdminAvatarService.removeAdminAvatar(avatarId, avatarName)
    setOpenConfirm(false)
  }

  return (
    <Box className={className}>
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
      <ConfirmModal
        open={openConfirm}
        description={`${t('admin:components.avatar.confirmAvatarDelete')} '${avatarName}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveAvatar}
      />
      {avatarData && openDrawer && (
        <DrawerView open onClose={() => setOpenDrawer(false)}>
          <AvatarSelectMenu
            adminStyles={styles}
            onAvatarUpload={() => dispatchAction(AdminAvatarActions.avatarUpdated())}
            changeActiveMenu={() => setOpenDrawer(false)}
            avatarData={avatarData}
          />
        </DrawerView>
      )}
    </Box>
  )
}

export default AvatarTable
