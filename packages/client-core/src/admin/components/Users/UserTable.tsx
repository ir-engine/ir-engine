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
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Tooltip from '@etherealengine/ui/src/primitives/mui/Tooltip'

import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { IdentityProviderType } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { DiscordIcon } from '../../../common/components/Icons/DiscordIcon'
import { FacebookIcon } from '../../../common/components/Icons/FacebookIcon'
import { GoogleIcon } from '../../../common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '../../../common/components/Icons/LinkedInIcon'
import { TwitterIcon } from '../../../common/components/Icons/TwitterIcon'
import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { UserData, UserProps, userColumns } from '../../common/variables/user'
import styles from '../../styles/admin.module.scss'
import UserDrawer, { UserDrawerMode } from './UserDrawer'

const UserTable = ({ className, search, skipGuests }: UserProps & { skipGuests: boolean }) => {
  const { t } = useTranslation()

  const openConfirm = useHookstate(false)
  const userName = useHookstate('')
  const userId = useHookstate('')

  const openUserDrawer = useHookstate(false)
  const userAdmin = useHookstate<UserType | undefined>(undefined)
  const authState = useHookstate(getMutableState(AuthState))
  const user = authState.user

  const adminUserQuery = useFind(userPath, {
    query: {
      search,
      isGuest: skipGuests ? false : undefined,
      $sort: { name: 1 },
      $skip: 0,
      $limit: 20
    }
  })

  useEffect(() => {
    if (search) {
      adminUserQuery.paginateState.store()
    } else {
      adminUserQuery.paginateState.restore()
    }
  }, [search])

  const removeUser = useMutation(userPath).remove

  const submitDeleteUser = async () => {
    await removeUser(userId.value)
    openConfirm.set(false)
  }

  const createData = (
    id: string,
    el: UserType,
    name: string,
    avatarId: string | JSX.Element,
    identityProviders: IdentityProviderType[],
    isGuest: string,
    inviteCode: string | JSX.Element
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
              <FacebookIcon width="20px" height="20px" viewBox="0 0 40 40" />
            </Tooltip>
          )}
          {twitterIp && (
            <Tooltip title={twitterIp.accountIdentifier!} arrow>
              <TwitterIcon width="20px" height="20px" viewBox="0 0 40 40" />
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
      inviteCode,
      action: (
        <>
          <a
            className={styles.actionStyle}
            onClick={() => {
              userAdmin.set(el)
              openUserDrawer.set(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          {user.id.value !== id && (
            <a
              className={styles.actionStyle}
              onClick={() => {
                userId.set(id)
                userName.set(name)
                openConfirm.set(true)
              }}
            >
              <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
            </a>
          )}
        </>
      )
    }
  }

  const rows = adminUserQuery.data.map((el) => {
    return createData(
      el.id,
      el,
      el.name,
      el.avatarId || <span className={styles.spanNone}>{t('admin:components.common.none')}</span>,
      el.identityProviders || [],
      el.isGuest.toString(),
      el.inviteCode || <span className={styles.spanNone}>{t('admin:components.common.none')}</span>
    )
  })

  return (
    <Box className={className}>
      <TableComponent query={adminUserQuery} rows={rows} column={userColumns} />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.user.confirmUserDelete')} '${userName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitDeleteUser}
      />
      {userAdmin.value && openUserDrawer.value && (
        <UserDrawer
          open
          mode={UserDrawerMode.ViewEdit}
          selectedUser={userAdmin.value}
          onClose={() => openUserDrawer.set(false)}
        />
      )}
    </Box>
  )
}

export default UserTable
