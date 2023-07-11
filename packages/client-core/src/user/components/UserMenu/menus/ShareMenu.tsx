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

import { useHookstate } from '@hookstate/core'
import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@etherealengine/client-core/src/common/components/Button'
import { OculusIcon } from '@etherealengine/client-core/src/common/components/Icons/OculusIcon'
import InputCheck from '@etherealengine/client-core/src/common/components/InputCheck'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { EMAIL_REGEX, PHONE_REGEX } from '@etherealengine/common/src/constants/IdConstants'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import multiLogger from '@etherealengine/common/src/logger'
import { isShareAvailable } from '@etherealengine/engine/src/common/functions/DetectFeatures'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { InviteService } from '../../../../social/services/InviteService'
import { AuthState } from '../../../services/AuthService'
import styles from '../index.module.scss'
import { PopupMenuServices } from '../PopupMenuService'

const logger = multiLogger.child({ component: 'client-core:ShareMenu' })

export const useShareMenuHooks = ({ refLink }) => {
  const { t } = useTranslation()
  const [token, setToken] = React.useState('')
  const [isSpectatorMode, setSpectatorMode] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState('')
  const engineState = useHookstate(getMutableState(EngineState))
  const selfUser = useHookstate(getMutableState(AuthState)).user

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
    let params = new URLSearchParams(location.search)
    const sendData = {
      inviteType: 'instance',
      token: token.length === 8 ? null : token,
      inviteCode: token.length === 8 ? token : null,
      identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
      targetObjectId: params.get('instanceId'),
      inviteeId: null,
      deleteOnUse: true
    } as SendInvite

    if (isSpectatorMode) {
      sendData.spawnType = 'spectate'
      sendData.spawnDetails = { spectate: selfUser.id.value }
    } else if (selfUser?.inviteCode.value) {
      sendData.spawnType = 'inviteCode'
      sendData.spawnDetails = { inviteCode: selfUser.inviteCode.value }
    }

    InviteService.sendInvite(sendData)
    setToken('')
  }

  const handleChangeToken = (e) => {
    setToken(e.target.value)
  }

  const getInviteLink = () => {
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    if (selfUser?.inviteCode.value != null) {
      params.set('inviteCode', selfUser.inviteCode.value)
      location.search = params.toString()
      return location.toString()
    } else {
      return location.toString()
    }
  }

  const getSpectateModeUrl = () => {
    const location = new URL(window.location as any)
    let params = new URLSearchParams(location.search)
    params.set('spectate', selfUser.id.value)
    params.delete('inviteCode')
    location.search = params.toString()
    return location.toString()
  }

  const toggleSpectatorMode = () => {
    setSpectatorMode(!isSpectatorMode)
  }

  useEffect(() => {
    if (engineState.shareLink.value !== '') setShareLink(engineState.shareLink.value)
    else setShareLink(isSpectatorMode ? getSpectateModeUrl() : getInviteLink())
  }, [engineState.shareLink.value, isSpectatorMode])

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
  const engineState = useHookstate(getMutableState(EngineState))
  const {
    copyLinkToClipboard,
    shareOnApps,
    packageInvite,
    handleChangeToken,
    token,
    shareLink,
    isSpectatorMode,
    toggleSpectatorMode
  } = useShareMenuHooks({
    refLink
  })

  // Ref: https://developer.oculus.com/documentation/web/web-launch
  let questShareLink = new URL('https://oculus.com/open_url/')
  questShareLink.searchParams.set('url', shareLink)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }

  return (
    <Menu
      open
      title={engineState.shareTitle.value ? engineState.shareTitle.value : t('user:usermenu.share.title')}
      onClose={() => PopupMenuServices.showPopupMenu()}
    >
      <Box className={styles.menuContent}>
        <Box className={styles.shareQuest}>
          <Button
            className={styles.shareQuestButton}
            endIcon={<OculusIcon sx={{ width: '36px', height: '36px', margin: '-7px 0 -5px -7px' }} />}
            type="gradientRounded"
            onClick={() => window.open(questShareLink, '_blank')}
          >
            {t('user:usermenu.share.shareQuest')}
          </Button>
          <IconButton
            icon={<Icon type="FileCopy" sx={{ width: '18px' }} />}
            sizePx={35}
            onClick={() => copyToClipboard(questShareLink.toString())}
          />
        </Box>

        <div className={styles.QRContainer}>
          <QRCodeSVG height={176} width={200} value={shareLink} />
        </div>

        {!engineState.shareTitle.value && (
          <InputCheck
            label={t('user:usermenu.share.lbl-spectator-mode')}
            checked={isSpectatorMode}
            onChange={toggleSpectatorMode}
          />
        )}

        <InputText
          endIcon={<Icon type="ContentCopy" />}
          inputRef={refLink}
          label={t('user:usermenu.share.shareDirect')}
          sx={{ mt: 2, mb: 3 }}
          value={shareLink}
          onEndIconClick={copyLinkToClipboard}
        />

        <InputText
          endIcon={<Icon type="Send" />}
          label={t('user:usermenu.share.shareInvite')}
          placeholder={t('user:usermenu.share.ph-phoneEmail')}
          value={token}
          onChange={(e) => handleChangeToken(e)}
          onEndIconClick={packageInvite}
        />

        {isShareAvailable && (
          <Button fullWidth type="solidRounded" endIcon={<Icon type="IosShare" />} onClick={shareOnApps}>
            {t('user:usermenu.share.lbl-share')}
          </Button>
        )}
      </Box>
    </Menu>
  )
}

export default ShareMenu
