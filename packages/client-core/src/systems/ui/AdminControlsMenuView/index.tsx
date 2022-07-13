import { createState } from '@speigg/hookstate'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss'

export function createAdminControlsMenuView() {
  return createXRUI(AdminControlsMenuView, createAdminControlsMenuState())
}

function createAdminControlsMenuState() {
  return createState({})
}

const AdminControlsMenuView = () => {
  const { t } = useTranslation()

  const handleOpenUserListMenuWidget = () => {
    // TODO open User List menu widget here...
  }

  const handleOpenBanListMenuWidget = () => {
    // TODO open Ban List menu widget here...
  }

  const handleOpenHelpMenuWidget = () => {
    // TODO open help menu widget here...
  }

  const handleOpenRequestSystemAdminMenuWidget = () => {
    // TODO open request system admin menu widget here...
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="container" xr-layer="true">
        <h3 className="heading">{t('user:usermenu.adminControls.containerHeading')}</h3>
        <XRTextButton content={t('user:usermenu.adminControls.btn-userList')} onClick={handleOpenUserListMenuWidget} />
        <XRTextButton content={t('user:usermenu.adminControls.btn-banList')} onClick={handleOpenBanListMenuWidget} />
        <XRTextButton content={t('user:usermenu.adminControls.btn-help')} onClick={handleOpenHelpMenuWidget} />
        <XRTextButton
          content={t('user:usermenu.adminControls.btn-requestSystemAdmin')}
          onClick={handleOpenRequestSystemAdminMenuWidget}
        />
      </div>
    </>
  )
}

export default AdminControlsMenuView
