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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import multiLogger from '@ir-engine/common/src/logger'
import { EMAIL_REGEX, PHONE_REGEX } from '@ir-engine/common/src/regex'
import { InviteCode, InviteData, authenticationSettingPath } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'

import { useFind } from '@ir-engine/common'
import { Checkbox, Input } from '@ir-engine/ui'
import { Copy03Lg, Send01Lg } from '@ir-engine/ui/src/icons'
import { InviteService } from '../../social/services/InviteService'
import { AuthState } from '../services/AuthService'

const logger = multiLogger.child({ component: 'client-core:ShareMenu' })

const useShareMenuHooks = ({ refLink }) => {
  const { t } = useTranslation()
  const [token, setToken] = React.useState('')
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState('')
  const selfUser = useMutableState(AuthState).user.value

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(refLink.current.value)
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

  const handleChangeToken = (e) => {
    setToken(e.target.value)
  }

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

  return {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  }
}

const ShareMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const {
    copyLinkToClipboard,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  } = useShareMenuHooks({
    refLink
  })

  useEffect(() => {
    logger.info({ event_name: 'share_clicked' })
  }, [])

  // Ref: https://developer.oculus.com/documentation/web/web-launch
  const questShareLink = new URL('https://oculus.com/open_url/')
  questShareLink.searchParams.set('url', shareLink)

  const iframeString = `<iframe src="${window.location.href}" height="100%" width="100%" allow="camera 'src'; microphone 'src';xr-spatial-tracking" style="pointer-events:all;user-select:none;border:none;"></iframe>`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }
  const authSetting = useFind(authenticationSettingPath).data.at(0)

  const getConnectPlaceholder = () => {
    let smsMagicLink,
      emailMagicLink = false

    if (authSetting?.authStrategies) {
      for (let item of authSetting.authStrategies) {
        if (item.smsMagicLink) smsMagicLink = true
        if (item.emailMagicLink) emailMagicLink = true
      }

      if (emailMagicLink && smsMagicLink) {
        return t('user:usermenu.share.ph-phoneEmail')
      } else if (emailMagicLink && !smsMagicLink) {
        return t('user:usermenu.share.ph-email')
      } else if (!emailMagicLink && smsMagicLink) {
        return t('user:usermenu.share.ph-phone')
      } else {
        return ''
      }
    } else return ''
  }

  return (
    <div className="relative z-50 h-fit max-h-[90vh] min-w-[720px] overflow-y-auto rounded-2xl bg-surface-1 p-6 mdh:max-h-[60vh] mdh:w-[50vw] mdh:max-w-2xl mdh:p-10">
      <div className="grid grid-cols-3 gap-x-3 gap-y-3">
        <div className="col-span-1 mdh:col-span-full">
          <div className="mb-3 flex w-full items-center justify-center">
            <div className="flex justify-center gap-x-4">
              <button
                className="rounded-3xl bg-gray-800 px-6 py-2"
                onClick={() => window.open(questShareLink, '_blank')}
              >
                {t('user:usermenu.share.shareQuest')}
              </button>

              <button
                className="text-text-secondary hover:text-text-primary"
                onClick={() => copyToClipboard(questShareLink.toString())}
              >
                <Copy03Lg />
              </button>
            </div>
          </div>

          <div className="flex w-full items-center justify-center ">
            <div className="rounded-md bg-white p-4">
              <QRCodeSVG height={176} width={200} value={shareLink} />
            </div>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-1 gap-y-3 mdh:col-span-full">
          <Checkbox
            label={t('user:usermenu.share.lbl-spectator-mode')}
            checked={isSpectatorMode}
            onChange={toggleSpectatorMode}
          />

          <Input
            readOnly
            value={shareLink}
            endComponent={
              <button className="h-4 w-4" onMouseDown={copyLinkToClipboard}>
                <Copy03Lg />
              </button>
            }
            labelProps={{
              text: t('user:usermenu.share.shareDirect'),
              position: 'top'
            }}
            fullWidth
            ref={refLink}
          />

          <Input
            readOnly
            value={iframeString}
            labelProps={{
              text: t('user:usermenu.share.shareEmbed'),
              position: 'top'
            }}
            endComponent={
              <button
                className="h-4 w-4"
                onMouseDown={() => {
                  copyToClipboard(iframeString)
                }}
              >
                <Copy03Lg />
              </button>
            }
            fullWidth
          />

          <Input
            value={token}
            labelProps={{
              text: t('user:usermenu.share.shareInvite'),
              position: 'top'
            }}
            placeholder={getConnectPlaceholder()}
            onChange={(e) => handleChangeToken(e)}
            endComponent={
              <button className="h-4 w-4" onMouseDown={packageInvite}>
                <Send01Lg />
              </button>
            }
            fullWidth
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                packageInvite()
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ShareMenu
