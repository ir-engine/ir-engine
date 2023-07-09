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

import { createState, useHookstate } from '@hookstate/core'
import { QRCodeSVG } from 'qrcode.react'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@etherealengine/engine/src/common/functions/DetectFeatures'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { getMutableState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { useShareMenuHooks } from '../../../user/components/UserMenu/menus/ShareMenu'
import XRCheckboxButton from '../../components/XRCheckboxButton'
import XRInput from '../../components/XRInput'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

/** @deprecated */
export function createShareLocationDetailView() {
  return createXRUI(ShareLocationDetailView, createShareLocationDetailState())
}

function createShareLocationDetailState() {
  return createState({})
}
/** @deprecated */
const ShareLocationDetailView = () => {
  const { t } = useTranslation()
  const engineState = useHookstate(getMutableState(EngineState))
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const { copyLinkToClipboard, shareOnApps, packageInvite, handleChangeToken, shareLink, token, toggleSpectatorMode } =
    useShareMenuHooks({
      refLink
    })

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <div className="header">
          {engineState.shareTitle.value ? (
            <h1 className="headerTitle">{engineState.shareTitle.value}</h1>
          ) : (
            <>
              <h1 className="headerTitle">{t('user:usermenu.share.title')}</h1>
              <XRCheckboxButton
                onChange={toggleSpectatorMode}
                labelContent={t('user:usermenu.share.lbl-spectator-mode')}
              />
            </>
          )}
          <div className="qrContainer">
            <QRCodeSVG height={176} width={200} value={shareLink} />
          </div>
          <XRInput
            ref={refLink}
            aria-invalid="false"
            disabled={true}
            type="text"
            value={shareLink}
            endIcon={<Icon type="FileCopy" />}
            endIconClick={copyLinkToClipboard}
          />
          <XRInput
            aria-invalid="false"
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            type="text"
            value={token}
            onChange={(e) => handleChangeToken(e)}
            endIcon={<Icon type="Send" />}
            endIconClick={packageInvite}
          />
          {isShareAvailable ? (
            <div className="shareAppContainer">
              <XRTextButton onClick={shareOnApps}>{t('user:usermenu.share.lbl-share')}</XRTextButton>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
