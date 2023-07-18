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

import React from 'react'
import { useTranslation } from 'react-i18next'

import Avatar from '@etherealengine/client-core/src/common/components/Avatar'
import Button from '@etherealengine/client-core/src/common/components/Button'
import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { CrownIcon } from '@etherealengine/client-core/src/common/components/Icons/CrownIcon'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { EMAIL_REGEX, PHONE_REGEX } from '@etherealengine/common/src/constants/IdConstants'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { SocialMenus } from '../../../../networking/NetworkInstanceProvisioning'
import { InviteService } from '../../../../social/services/InviteService'
import { PartyService, PartyState } from '../../../../social/services/PartyService'
import { AuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

export const usePartyMenuHooks = () => {
  const token = useHookstate('')
  const isInviteOpen = useHookstate(false)
  const isDeleteConfirmOpen = useHookstate(false)
  const partyState = useHookstate(getMutableState(PartyState))
  const selfUser = useHookstate(getMutableState(AuthState).user)

  const isOwned = partyState.isOwned?.value

  const createParty = () => {
    PartyService.createParty()
  }

  const kickUser = (userId?: UserId) => {
    if (!userId) return
    const partyUser = partyState.party?.partyUsers?.value
      ? partyState.party.partyUsers.value.find((partyUser) => {
          return partyUser.userId === userId
        })
      : null
    if (partyUser) PartyService.removePartyUser(partyUser.id)
  }

  const handleChangeToken = (e) => {
    token.set(e.target.value)
  }

  const deleteParty = (partyId: string) => {
    PartyService.removeParty(partyId)
  }

  const sendInvite = async (): Promise<void> => {
    const isEmail = EMAIL_REGEX.test(token.value)
    const isPhone = PHONE_REGEX.test(token.value)
    const sendData = {
      inviteType: 'party',
      token: token.value,
      inviteCode: null,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: partyState.party.id.value,
      inviteeId: null,
      deleteOnUse: true,
      spawnType: 'inviteCode',
      spawnDetails: { inviteCode: selfUser.inviteCode.value }
    } as SendInvite

    InviteService.sendInvite(sendData)
    token.set('')
    isInviteOpen.set(false)
  }

  return {
    createParty,
    kickUser,
    token: token.value,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    isDeleteConfirmOpen,
    deleteParty,
    isOwned,
    selfUser
  }
}

const PartyMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const partyState = useHookstate(getMutableState(PartyState))

  const {
    createParty,
    kickUser,
    token,
    handleChangeToken,
    sendInvite,
    isInviteOpen,
    isDeleteConfirmOpen,
    deleteParty,
    isOwned,
    selfUser
  } = usePartyMenuHooks()

  const renderCreate = () => {
    return (
      <Text align="center" flex={1} mt={4} variant="body2">
        {t('user:usermenu.party.createPartyText')}
      </Text>
    )
  }

  const renderUser = () => {
    return partyState.party.partyUsers.get({ noproxy: true })?.map((user, i) => {
      return (
        <Box key={i} display="flex" alignItems="center" mb={2} gap={1}>
          <Avatar imageSrc={user.user?.avatar?.thumbnailResource?.url} size={50} />

          <Text>{user.user?.name}</Text>

          {user.isOwner && <CrownIcon sx={{ height: '22px', width: '22px', mt: -0.5 }} />}

          <Box flex={1} />

          {user.user?.id === selfUser.id.value ? (
            <Text variant="body2">{t('user:usermenu.party.you')}</Text>
          ) : partyState.isOwned.value && user.user ? (
            <Text color="red" variant="body2" onClick={() => kickUser(user.user?.id)}>
              {t('user:usermenu.party.kick')}
            </Text>
          ) : null}
        </Box>
      )
    })
  }

  const renderCreateButtons = () => {
    return (
      <Box flex={1}>
        <Button fullWidth type="gradientRounded" onClick={createParty}>
          {t('user:usermenu.party.create')}
        </Button>
        <Box display="flex" columnGap={1} alignItems="center">
          <Button fullWidth type="gradientRounded" onClick={() => PopupMenuServices.showPopupMenu(SocialMenus.Friends)}>
            {t('user:usermenu.share.friends')}
          </Button>
        </Box>
      </Box>
    )
  }

  const renderUserButtons = () => {
    return (
      <Box flex={1}>
        {isInviteOpen.value && (
          <InputText
            endIcon={<Icon type="Send" />}
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            startIcon={<Icon type="Clear" />}
            sx={{ mb: 1, mt: 1 }}
            value={token}
            onChange={(e) => handleChangeToken(e)}
            onEndIconClick={sendInvite}
            onStartIconClick={() => isInviteOpen.set(false)}
          />
        )}

        <Box display="flex" columnGap={2} alignItems="center">
          <Button fullWidth type="gradientRounded" onClick={() => kickUser(selfUser.id.value)}>
            {t('user:usermenu.party.leave')}
          </Button>
          {isOwned && (
            <Button fullWidth type="gradientRounded" onClick={() => isInviteOpen.set(!isInviteOpen.value)}>
              {t('user:usermenu.party.invite')}
            </Button>
          )}
        </Box>

        {isOwned && (
          <Button fullWidth type="gradientRounded" onClick={() => isDeleteConfirmOpen.set(true)}>
            {t('user:common.delete')}
          </Button>
        )}

        {isDeleteConfirmOpen.value && (
          <ConfirmDialog
            open
            description={t('user:usermenu.party.deleteConfirmation')}
            submitButtonText={t('user:common.delete')}
            onClose={() => isDeleteConfirmOpen.set(false)}
            onSubmit={() => {
              deleteParty(partyState.party.id.value)
              isDeleteConfirmOpen.set(false)
            }}
          />
        )}
      </Box>
    )
  }

  return (
    <Menu
      open
      maxWidth="xs"
      title={t('user:usermenu.party.title')}
      actions={partyState.party.value ? renderUserButtons() : renderCreateButtons()}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent} display="flex" flexDirection="column">
        {partyState.party.value ? renderUser() : renderCreate()}
      </Box>
    </Menu>
  )
}

export default PartyMenu
