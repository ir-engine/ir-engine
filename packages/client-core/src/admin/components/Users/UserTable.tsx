import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { User } from '@xrengine/common/src/interfaces/User'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import { useFetchUsersAsAdmin } from '../../common/hooks/User.hooks'
import TableComponent from '../../common/Table'
import { userColumns, UserData, UserProps } from '../../common/variables/user'
import { USER_PAGE_LIMIT, UserService, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import ViewUser from './ViewUser'

const UserTable = (props: UserProps) => {
  const { search } = props
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(USER_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [viewModal, setViewModal] = useState(false)
  const [userAdmin, setUserAdmin] = useState<User | null>(null)
  const authState = useAuthState()
  const user = authState.user
  const adminUserState = useUserState()
  const adminUsers = adminUserState.users.value
  const adminUserCount = adminUserState.total
  const { t } = useTranslation()
  useFetchUsersAsAdmin(user, adminUserState, UserService, search, sortField, fieldOrder)

  const handlePageChange = (event: unknown, newPage: number) => {
    UserService.fetchUsersAsAdmin(search, newPage, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminUserState.fetched.value) {
      UserService.fetchUsersAsAdmin(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const closeViewModal = (open) => {
    setViewModal(open)
  }

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  const submitDeleteUser = async () => {
    await UserService.removeUserAdmin(userId)
    setPopConfirmOpen(false)
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
            href="#h"
            className={styles.actionStyle}
            onClick={() => {
              setUserAdmin(el)
              setViewModal(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.index.view')}</span>
          </a>
          {user.id.value !== id && (
            <a
              href="#h"
              className={styles.actionStyle}
              onClick={() => {
                setUserId(id)
                setUserName(name)
                setPopConfirmOpen(true)
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
    <React.Fragment>
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
        popConfirmOpen={popConfirmOpen}
        handleCloseModal={handleCloseModal}
        submit={submitDeleteUser}
        name={userName}
        label={'user'}
      />
      {userAdmin && viewModal && (
        <ViewUser openView={viewModal} userAdmin={userAdmin} closeViewModal={closeViewModal} />
      )}
    </React.Fragment>
  )
}

export default UserTable
