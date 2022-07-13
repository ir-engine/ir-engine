import { createState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { useAuthState } from '../../../user/services/AuthService'
import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createLocationMenuView() {
  return createXRUI(LocationMenuView, createLocationMenuState())
}

function createLocationMenuState() {
  return createState({})
}

const LocationMenuView = () => {
  const { t } = useTranslation()

  const isAdmin = useAuthState().user?.userRole?.value === 'admin'

  const handleOpenEmoteMenuWidget = () => {
    // TODO open emote menu widget here...
  }

  const handleOpenHelpMenuWidget = () => {
    // TODO open help menu widget here...
  }

  const handleOpenReportIssueMenuWidget = () => {
    // TODO open report issue menu widget here...
  }

  const handleToggleScreenRecord = () => {
    // TODO toggle screen record here...
  }

  const handleOpenAdminControlsMenuWidget = () => {
    // TODO open admin controls menu here...
  }

  const handleRespawnAvatar = () => {
    respawnAvatar(Engine.instance.currentWorld.localClientEntity)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.location.containerHeading')}</h3>
        <XRTextButton content={t('user:usermenu.location.btn-respawn')} onClick={handleRespawnAvatar} />
        <XRTextButton content={t('user:usermenu.location.btn-emote')} onClick={handleOpenEmoteMenuWidget} />
        <XRTextButton content={t('user:usermenu.location.btn-help')} onClick={handleOpenHelpMenuWidget} />
        <XRTextButton content={t('user:usermenu.location.btn-reportIssue')} onClick={handleOpenReportIssueMenuWidget} />
        <XRTextButton content={t('user:usermenu.location.btn-screenRecord')} onClick={handleToggleScreenRecord} />
        {isAdmin && (
          <XRTextButton
            content={t('user:usermenu.location.btn-adminControls')}
            onClick={handleOpenAdminControlsMenuWidget}
          />
        )}
      </div>
    </>
  )
}

export default LocationMenuView
