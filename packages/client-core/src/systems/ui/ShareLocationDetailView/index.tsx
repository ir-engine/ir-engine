import { createState } from '@speigg/hookstate'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { isShareAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { FileCopy, Send } from '@mui/icons-material'

import { useShareMenuHooks } from '../../../user/components/UserMenu/menus/ShareMenu'
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
  const refLink = useRef() as React.MutableRefObject<HTMLInputElement>

  const { copyLinkToClipboard, shareOnApps, packageInvite, handleChangeEmail, shareLink, email } = useShareMenuHooks({
    refLink
  })

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <div className="header">
          <h1 className="headerTitle">{t('user:usermenu.share.title')}</h1>
          <XRInput
            ref={refLink}
            aria-invalid="false"
            disabled={true}
            type="text"
            value={shareLink}
            endIconClick={copyLinkToClipboard}
          />
          <XRInput
            aria-invalid="false"
            placeholder={t('user:usermenu.share.ph-phoneEmail')}
            type="text"
            value={email}
            onChange={(e) => handleChangeEmail(e)}
            endIcon={<Send />}
            endIconClick={packageInvite}
          />
          {isShareAvailable ? (
            <div className="shareAppContainer">
              <XRTextButton onClick={shareOnApps} content={t('user:usermenu.share.lbl-share')} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
