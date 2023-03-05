import { createState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import Icon from '@etherealengine/ui/src/Icon'

import XRTextButton from '../../components/XRTextButton'
import styleString from './index.scss?inline'

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
        <XRTextButton onClick={handleOpenUserListMenuWidget}>
          <Icon type="People" />
          {t('user:usermenu.adminControls.btn-userList')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenBanListMenuWidget}>
          <Icon type="Block" />
          {t('user:usermenu.adminControls.btn-banList')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenHelpMenuWidget}>
          <Icon type="Help" />
          {t('user:usermenu.adminControls.btn-help')}
        </XRTextButton>
        <XRTextButton onClick={handleOpenRequestSystemAdminMenuWidget}>
          <Icon type="ContactMail" />
          {t('user:usermenu.adminControls.btn-requestSystemAdmin')}
        </XRTextButton>
      </div>
    </>
  )
}

export default AdminControlsMenuView
