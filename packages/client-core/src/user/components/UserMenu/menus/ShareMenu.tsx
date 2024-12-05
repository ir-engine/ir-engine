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

import { FormControl, InputLabel } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@ir-engine/client-core/src/common/components/Button'
import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import { OculusIcon } from '@ir-engine/client-core/src/common/components/Icons/OculusIcon'
import InputCheck from '@ir-engine/client-core/src/common/components/InputCheck'
import InputText from '@ir-engine/client-core/src/common/components/InputText'
import Menu from '@ir-engine/client-core/src/common/components/Menu'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import multiLogger from '@ir-engine/common/src/logger'
import { EMAIL_REGEX, PHONE_REGEX } from '@ir-engine/common/src/regex'
import { authenticationSettingPath, InviteCode, InviteData } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import { isShareAvailable } from '@ir-engine/spatial/src/common/functions/DetectFeatures'
import Box from '@ir-engine/ui/src/primitives/mui/Box'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButton from '@ir-engine/ui/src/primitives/mui/IconButton'
import OutlinedInput from '@ir-engine/ui/src/primitives/mui/OutlinedInput'

import { useFind } from '@ir-engine/common'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import useFeatureFlags from '../../../../hooks/useFeatureFlags'
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

  const [shareTOQuestEnabled] = useFeatureFlags([FeatureFlags.Client.Menu.ShareToQuest])

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
    <Menu open title={t('user:usermenu.share.title')} onClose={() => PopupMenuServices.showPopupMenu()}>
      <Box className={styles.menuContent}>
        {shareTOQuestEnabled && (
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
        )}

        <div className={styles.QRContainer}>
          <QRCodeSVG height={176} width={200} value={shareLink} />
        </div>

        <InputCheck
          label={t('user:usermenu.share.lbl-spectator-mode')}
          checked={isSpectatorMode}
          onChange={toggleSpectatorMode}
        />

        <InputText
          endIcon={<Icon type="ContentCopy" />}
          inputRef={refLink}
          label={t('user:usermenu.share.shareDirect')}
          sx={{ mt: 2, mb: 3 }}
          value={shareLink}
          onEndIconClick={copyLinkToClipboard}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 3 }}>
          <Box sx={{ display: 'flex' }}>
            <FormControl
              variant="outlined"
              className={`${commonStyles.inputField}`}
              disabled={true}
              focused={true}
              size="small"
            >
              <InputLabel sx={{ zIndex: 999 }}>{t('user:usermenu.share.shareEmbed')}</InputLabel>
              <OutlinedInput
                disabled={true}
                fullWidth
                label={t('user:usermenu.share.shareEmbed')}
                size={'small'}
                endAdornment={
                  <IconButton
                    className={styles.iconButton}
                    icon={<Icon type="ContentCopy" />}
                    sx={{ mr: -1.5 }}
                    onClick={() => copyToClipboard(iframeString)}
                  />
                }
                value={iframeString}
              />
            </FormControl>
          </Box>
        </Box>

        <InputText
          endIcon={<Icon type="Send" />}
          label={t('user:usermenu.share.shareInvite')}
          placeholder={getConnectPlaceholder()}
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
