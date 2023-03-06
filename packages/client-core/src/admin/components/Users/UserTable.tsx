import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { IdentityProvider } from '@etherealengine/common/src/interfaces/IdentityProvider'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import Box from '@etherealengine/ui/src/Box'
import Icon from '@etherealengine/ui/src/Icon'
import Tooltip from '@etherealengine/ui/src/Tooltip'

import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { useAuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { userColumns, UserData, UserProps } from '../../common/variables/user'
import { AdminUserService, USER_PAGE_LIMIT, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import UserDrawer, { UserDrawerMode } from './UserDrawer'

const UserTable = ({ className, search }: UserProps) => {
  const { t } = useTranslation()

  const [rowsPerPage, setRowsPerPage] = useState(USER_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [openUserDrawer, setOpenUserDrawer] = useState(false)
  const [userAdmin, setUserAdmin] = useState<UserInterface | null>(null)
  const authState = useAuthState()
  const user = authState.user
  const adminUserState = useUserState()
  const skip = adminUserState.skip.value
  const adminUsers = adminUserState.users.value
  const adminUserCount = adminUserState.total

  const page = skip / USER_PAGE_LIMIT

  useEffect(() => {
    AdminUserService.fetchUsersAsAdmin(search, 0, sortField, fieldOrder)
  }, [search, user?.id?.value, adminUserState.updateNeeded.value])

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminUserService.fetchUsersAsAdmin(search, newPage, sortField, fieldOrder)
  }

  useEffect(() => {
    if (adminUserState.fetched.value) {
      AdminUserService.fetchUsersAsAdmin(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
  }

  const submitDeleteUser = async () => {
    await AdminUserService.removeUserAdmin(userId)
    setOpenConfirm(false)
  }

  const createData = (
    id: string,
    el: UserInterface,
    name: string,
    avatarId: string | JSX.Element,
    identityProviders: IdentityProvider[],
    isGuest: string,
    location: string | JSX.Element,
    inviteCode: string | JSX.Element,
    instanceId: string | JSX.Element
  ): UserData => {
    const discordIp = identityProviders.find((ip) => ip.type === 'discord')
    const googleIp = identityProviders.find((ip) => ip.type === 'google')
    const facebookIp = identityProviders.find((ip) => ip.type === 'facebook')
    const twitterIp = identityProviders.find((ip) => ip.type === 'twitter')
    const linkedinIp = identityProviders.find((ip) => ip.type === 'linkedin')
    const githubIp = identityProviders.find((ip) => ip.type === 'github')
    const emailIp = identityProviders.find((ip) => ip.type === 'email')
    const smsIp = identityProviders.find((ip) => ip.type === 'sms')

    return {
      id,
      el,
      name,
      avatarId,
      accountIdentifier: (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {discordIp && (
            <Tooltip title={discordIp.accountIdentifier!} arrow>
              <DiscordIcon width="20px" height="20px" viewBox="0 0 40 40" />
            </Tooltip>
          )}
          {googleIp && (
            <Tooltip title={googleIp.accountIdentifier!} arrow>
              <GoogleIcon width="20px" height="20px" viewBox="0 0 40 40" />
            </Tooltip>
          )}
          {facebookIp && (
            <Tooltip title={facebookIp.accountIdentifier!} arrow>
              <Icon type="Facebook" width="20px" height="20px" viewBox="0 0 40 40" />
            </Tooltip>
          )}
          {twitterIp && (
            <Tooltip title={twitterIp.accountIdentifier!} arrow>
              <Icon type="Twitter" width="20px" height="20px" viewBox="0 0 40 40" />
            </Tooltip>
          )}
          {linkedinIp && (
            <Tooltip title={linkedinIp.accountIdentifier!} arrow>
              <LinkedInIcon width="20px" height="20px" viewBox="0 0 40 40" />
            </Tooltip>
          )}
          {githubIp && (
            <Tooltip title={githubIp.accountIdentifier!} arrow>
              <Icon type="GitHub" width="20px" height="20px" />
            </Tooltip>
          )}
          {emailIp && (
            <Tooltip title={emailIp.accountIdentifier!} arrow>
              <Icon type="Email" width="20px" height="20px" />
            </Tooltip>
          )}
          {smsIp && (
            <Tooltip title={smsIp.accountIdentifier!} arrow>
              <Icon type="Phone" width="20px" height="20px" />
            </Tooltip>
          )}
        </Box>
      ),
      isGuest,
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
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
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
              <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
            </a>
          )}
        </>
      )
    }
  }

  const rows = adminUsers.map((el) => {
    return createData(
      el.id,
      el,
      el.name,
      el.avatarId || <span className={styles.spanNone}>{t('admin:components.common.none')}</span>,
      el.identity_providers || [],
      el.isGuest.toString(),
      el.instance && el.instance.location ? (
        el.instance.location.name
      ) : (
        <span className={styles.spanNone}>{t('admin:components.common.none')}</span>
      ),
      el.inviteCode || <span className={styles.spanNone}>{t('admin:components.common.none')}</span>,
      el.instance ? el.instance.ipAddress : <span className={styles.spanNone}>{t('admin:components.common.none')}</span>
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
      <ConfirmDialog
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
