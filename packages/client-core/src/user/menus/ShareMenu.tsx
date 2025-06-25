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

import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import multiLogger from '@ir-engine/common/src/logger'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'

import { useFind } from '@ir-engine/common'
import { unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { Button, Input } from '@ir-engine/ui'
import { Copy03Lg, Send01Lg, Share06Sm } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useShareMenu } from '../../hooks/useShareMenu'
import { clientContextParams } from '../../util/ClientContextState'

const logger = multiLogger.child({ component: 'client-core:ShareMenu', modifier: clientContextParams })

const ShareMenu = (): JSX.Element => {
  const { t } = useTranslation()
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const { copyLinkToClipboard, packageInvite, handleChangeToken, token, shareLink } = useShareMenu()

  useEffect(() => {
    logger.analytics({ event_name: 'share_clicked' })
  }, [])

  // Ref: https://developer.oculus.com/documentation/web/web-launch
  const questShareLink = new URL('https://oculus.com/open_url/')
  questShareLink.searchParams.set('url', shareLink)

  const iframeString = `<iframe src="${
    window.location.origin + window.location.pathname
  }" height="100%" width="100%" allow="camera 'src'; microphone 'src';xr-spatial-tracking" style="pointer-events:all;user-select:none;border:none;"></iframe>`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    NotificationService.dispatchNotify(t('user:usermenu.share.linkCopied'), { variant: 'success' })
  }
  const engineSettingData = useFind(engineSettingPath, {
    query: {
      category: 'authentication',
      paginate: false
    }
  })
  const authSetting = unflattenArrayToObject(
    engineSettingData.data.map((el) => ({ key: el.key, value: el.value, dataType: el.dataType }))
  )

  const getConnectPlaceholder = () => {
    let smsMagicLink = false,
      emailMagicLink = false

    if (authSetting?.authStrategies) {
      for (const authStrategies of authSetting.authStrategies) {
        if (authStrategies.smsMagicLink) smsMagicLink = true
        if (authStrategies.emailMagicLink) emailMagicLink = true
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
    <div className="relative z-50 h-fit max-h-[90dvh] min-w-[720px] rounded-2xl bg-surface-4 pb-4 pt-[16.5px] smh:max-h-[60dvh] smh:w-[50vw] smh:max-w-2xl smh:pb-0">
      <div className="mx-[32px] grid grid-cols-3 gap-y-3">
        <div className="col-span-3 flex w-full items-center justify-center smh:hidden">
          <Text fontWeight="medium" className="text-text-primary">
            {t('user:usermenu.share.description-share')}
          </Text>
        </div>

        <div className="col-span-1 smh:col-span-full">
          <div className="mb-[16.5px] hidden w-full items-center justify-center smh:flex">
            <Text fontWeight="medium" className="text-text-primary">
              {t('user:usermenu.share.description-share')}
            </Text>
          </div>

          <div className="flex w-fit items-center justify-center smh:w-full">
            <div className="rounded-lg bg-white p-4">
              <QRCodeSVG className="h-[130px] w-[147px] smh:h-[161px] smh:w-[184px]" value={shareLink} />
            </div>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-1 smh:col-span-full smh:gap-y-3">
          <Input
            readOnly
            value={shareLink}
            endComponent={
              <button className="h-4 w-4 text-text-primary" onMouseDown={() => copyLinkToClipboard()}>
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

          <div className="hidden smh:block">
            <Input
              readOnly
              value={iframeString}
              labelProps={{
                text: t('user:usermenu.share.shareEmbed'),
                position: 'top'
              }}
              endComponent={
                <button
                  className="h-4 w-4 text-text-primary"
                  onMouseDown={() => {
                    copyToClipboard(iframeString)
                  }}
                >
                  <Copy03Lg />
                </button>
              }
              fullWidth
            />
          </div>

          <div className="-mt-4 smh:mt-0">
            <Input
              value={token}
              labelProps={{
                text: t('user:usermenu.profile.connectEmail'),
                position: 'top'
              }}
              placeholder={getConnectPlaceholder()}
              onChange={(e) => handleChangeToken(e)}
              endComponent={
                <button className="h-4 w-4 text-text-primary" onMouseDown={packageInvite}>
                  <Send01Lg />
                </button>
              }
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter') packageInvite()
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 hidden w-full items-center justify-center border-t-[0.5px] border-[#212226] py-[11px] smh:flex">
        <Button
          variant="secondary"
          size="l"
          onClick={() =>
            isMobile && 'navigator' in window
              ? window.navigator.share({ url: shareLink })
              : window.open(shareLink, '_blank')?.focus()
          }
        >
          <Share06Sm />
          {t('user:usermenu.share.lbl-share')}
        </Button>
      </div>
    </div>
  )
}

export default ShareMenu
