import { createState } from '@hookstate/core'
import { QRCodeSVG } from 'qrcode.react'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { FileCopy, Send } from '@mui/icons-material'

import { useShareMenuHooks } from '../../../user/components/UserMenu/menus/ShareMenu'
import XRCheckboxButton from '../../components/XRCheckboxButton'
import XRInput from '../../components/XRInput'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createShareLocationDetailView() {
  return createXRUI(ShareLocationDetailView, createShareLocationDetailState())
}

function createShareLocationDetailState() {
  return createState({})
}

const ShareLocationDetailView = () => {
  const { t } = useTranslation()
  const engineState = useEngineState()
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
            endIcon={<FileCopy />}
            endIconClick={copyLinkToClipboard}
          />
          <XRInput
            aria-invalid="false"
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            type="text"
            value={token}
            onChange={(e) => handleChangeToken(e)}
            endIcon={<Send />}
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
