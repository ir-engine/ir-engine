import React from 'react'
import { Helmet } from 'react-helmet'

import { useClientSettingState } from '@xrengine/client-core/src/admin/services/Setting/ClientSettingService'
import RoomMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/RoomMenu'

export const RoomPage = (): any => {
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []

  return (
    <div className="lander">
      <style>
        {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
      </style>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <div className="main-background">
        <div className="img-container">
          {clientSetting?.appBackground && <img src={clientSetting.appBackground} alt="" crossOrigin="anonymous" />}
        </div>
      </div>
      <nav className="navbar">
        <div className="logo-section">
          {clientSetting?.appTitle && <object className="lander-logo" data={clientSetting.appTitle} />}
          <div className="logo-bottom">
            {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting.appSubtitle}</span>}
          </div>
        </div>
      </nav>
      <div className="main-section">
        <div className="form-container">
          <style>
            {`
                [class*=menuPanel] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    min-width: 420px;
                    transform: none;
                    pointer-events: auto;
                }
              `}
          </style>
          <RoomMenu />
        </div>
      </div>
    </div>
  )
}

export default RoomPage
