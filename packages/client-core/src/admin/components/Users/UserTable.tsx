import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { User } from '@xrengine/common/src/interfaces/User'

import Box from '@mui/material/Box'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { userColumns, UserData, UserProps } from '../../common/variables/user'
import { AdminUserService, USER_PAGE_LIMIT, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import UserDrawer, { UserDrawerMode } from './UserDrawer'

const UserTable = ({ className, search }: UserProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(USER_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [openUserDrawer, setOpenUserDrawer] = useState(false)
  const [userAdmin, setUserAdmin] = useState<User | null>(null)
  const authState = useAuthState()
  const user = authState.user
  const adminUserState = useUserState()
  const adminUsers = adminUserState.users.value
  const adminUserCount = adminUserState.total
  const { t } = useTranslation()

  useEffect(() => {
    AdminUserService.fetchUsersAsAdmin(search, 0, sortField, fieldOrder)
  }, [search, user?.id?.value, adminUserState.updateNeeded.value])

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminUserService.fetchUsersAsAdmin(search, newPage, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminUserState.fetched.value) {
      AdminUserService.fetchUsersAsAdmin(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const submitDeleteUser = async () => {
    await AdminUserService.removeUserAdmin(userId)
    setOpenConfirm(false)
  }

  const createData = (
    id: string,
    el: User,
    name: string,
    avatarId: string | JSX.Element,
    userRole: string | JSX.Element,
    location: string | JSX.Element,
    inviteCode: string | JSX.Element,
    instanceId: string | JSX.Element
  ): UserData => {
    return {
      id,
      el,
      name,
      avatarId,
      userRole,
      location,
      inviteCode,
      instanceId,
      action: (
        <>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setUserAdmin(el)
              setOpenUserDrawer(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.index.view')}</span>
          </a>
          {user.id.value !== id && (
            <a
              href="#"
              className={styles.actionStyle}
              onClick={() => {
                setUserId(id)
                setUserName(name)
                setOpenConfirm(true)
              }}
            >
              <span className={styles.spanDange}>{t('admin:components.index.delete')}</span>
            </a>
          )}
        </>
      )
    }
  }

  const rows = adminUsers.map((el) => {
    const loc = el.party?.id ? el.party.location : null
    const loca = loc ? (
      loc.name || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
    ) : (
      <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
    )
    const ins = el.party?.id ? el.party.instance : null
    const inst = ins ? (
      ins.ipAddress || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
    ) : (
      <span className={styles.spanNone}>{t('admin:components.index.none')}</span>
    )

    return createData(
      el.id || '',
      el,
      el.name,
      el.avatarId || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>,
      el.userRole || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>,
      loca,
      el.inviteCode || <span className={styles.spanNone}>{t('admin:components.index.none')}</span>,
      inst
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
        column={userColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminUserCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModal
        open={openConfirm}
        description={`${t('admin:components.user.confirmUserDelete')} '${userName}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitDeleteUser}
      />
      {userAdmin && openUserDrawer && (
        <UserDrawer
          open
          mode={UserDrawerMode.ViewEdit}
          selectedUser={userAdmin}
          onClose={() => setOpenUserDrawer(false)}
        />
      )}
    </Box>
  )
}

export default UserTable
