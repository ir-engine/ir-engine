import React from 'react'

import { useClientSettingState } from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import RoomMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/RoomMenu'

import Box from '@mui/material/Box'

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
      <MetaTags>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
          rel="stylesheet"
        />
      </MetaTags>
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
        <Box sx={{ flex: 1 }}>
          <style>
            {`
                [class*=menu] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    transform: none;
                    pointer-events: auto;
                }
              `}
          </style>
          <RoomMenu />
        </Box>
      </div>
    </div>
  )
}

export default RoomPage
