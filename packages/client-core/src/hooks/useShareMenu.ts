/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import multiLogger from '@ir-engine/common/src/logger'
import { EMAIL_REGEX, PHONE_REGEX } from '@ir-engine/common/src/regex'
import { InviteCode, InviteData } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import { NotificationService } from '../common/services/NotificationService'

import { InviteService } from '../social/services/InviteService'
import { AuthState } from '../user/services/AuthService'
import { clientContextParams } from '../util/ClientContextState'

const logger = multiLogger.child({ component: 'client-core:ShareMenu', modifier: clientContextParams })

export interface UseShareMenuProps {
  refLink?: React.MutableRefObject<HTMLInputElement>
}

export const useShareMenu = ({ refLink } = {} as UseShareMenuProps) => {
  const { t } = useTranslation()
  const [token, setToken] = React.useState('')
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState('')
  const selfUser = useMutableState(AuthState).user.value

  const getInviteLink = () => {
    const location = new URL(window.location as any)
    const params = new URLSearchParams(location.search)
    if (selfUser?.inviteCode != null) {
      params.set('inviteCode', selfUser.inviteCode)
      location.search = params.toString()
      return location.toString()
    } else {
      return location.toString()
    }
  }

  const inviteLink = getInviteLink()

  const copyLinkToClipboard = (link?: string) => {
    navigator.clipboard.writeText(link ?? refLink?.current.value ?? inviteLink)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }

  const shareOnApps = () => {
    navigator
      .share({
        title: t('user:usermenu.share.shareTitle'),
        text: t('user:usermenu.share.shareDescription'),
        url: document.location.href
      })
      .then(() => {
        logger.info('Successfully shared')
      })
      .catch((error) => {
        logger.error(error, 'Error during sharing')
        NotificationService.dispatchNotify(t('user:usermenu.share.shareFailed'), { variant: 'error' })
      })
  }

  const packageInvite = async (): Promise<void> => {
    const isEmail = EMAIL_REGEX.test(token)
    const isPhone = PHONE_REGEX.test(token)
    const location = new URL(window.location as any)
    const params = new URLSearchParams(location.search)
    let inviteCode = '' as InviteCode

    const sendData = {
      inviteType: 'instance',
      token: token.length === 8 ? null : token,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: params.get('instanceId'),
      deleteOnUse: true
    } as InviteData

    if (token.length === 8) {
      inviteCode = token as InviteCode
    }

    if (isSpectatorMode) {
      sendData.spawnType = 'spectate'
      sendData.spawnDetails = { spectate: selfUser.id }
    } else if (selfUser?.inviteCode) {
      sendData.spawnType = 'inviteCode'
      sendData.spawnDetails = { inviteCode: selfUser.inviteCode }
    }

    InviteService.sendInvite(sendData, inviteCode)
    setToken('')
  }

  const handleChangeToken = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
  }

  const getSpectateModeUrl = () => {
    const location = new URL(window.location as any)
    const params = new URLSearchParams(location.search)
    params.set('spectate', selfUser.id)
    params.delete('inviteCode')
    location.search = params.toString()
    return location.toString()
  }

  const toggleSpectatorMode = () => {
    setSpectatorMode(!isSpectatorMode)
  }

  useEffect(() => {
    setShareLink(isSpectatorMode ? getSpectateModeUrl() : getInviteLink())
  }, [isSpectatorMode])

  const questLink = new URL('https://oculus.com/open_url/')
  questLink.searchParams.set('url', shareLink)
  console.log(questLink)

  return {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode,
    questLink: questLink.toString(),
    inviteLink
  }
}
