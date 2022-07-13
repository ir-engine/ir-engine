import { createState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createSocialsMenuView() {
  return createXRUI(SocialsMenuView, createSocialsMenuState())
}

function createSocialsMenuState() {
  return createState({})
}

const SocialsMenuView = () => {
  const { t } = useTranslation()

  const handleOpenFriendMenuWidget = () => {
    // TODO open friend menu widget here...
  }

  const handleOpenPartyGroupMenuWidget = () => {
    // TODO open party group menu widget here...
  }

  const handleOpenMediaSessionsMenuWidget = () => {
    // TODO open media session menu widget here...
  }

  const handleOpenShareLocationMenuWidget = () => {
    // TODO open share location menu widget here...
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.socials.containerHeading')}</h3>
        <XRTextButton content={t('user:usermenu.socials.btn-friend')} onClick={handleOpenFriendMenuWidget} />
        <XRTextButton content={t('user:usermenu.socials.btn-party-group')} onClick={handleOpenPartyGroupMenuWidget} />
        <XRTextButton
          content={t('user:usermenu.socials.btn-mediaSession')}
          onClick={handleOpenMediaSessionsMenuWidget}
        />
        <XRTextButton
          content={t('user:usermenu.socials.btn-share-invite')}
          onClick={handleOpenShareLocationMenuWidget}
        />
      </div>
    </>
  )
}

export default SocialsMenuView
