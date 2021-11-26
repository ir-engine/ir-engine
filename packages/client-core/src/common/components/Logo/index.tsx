import React, { useEffect, useState } from 'react'
import { Config } from '@xrengine/common/src/config'
import { ClientSettingService } from '../../../admin/services/Setting/ClientSettingService'
import { useClientSettingState } from '../../../admin/services/Setting/ClientSettingService'

interface Props {
  onClick: any
}

const Logo = (props: Props): any => {
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const [logo, setLogo] = useState(clientSetting?.logo)

  useEffect(() => {
    !clientSetting && ClientSettingService.fetchedClientSettings()
  }, [])

  useEffect(() => {
    if (clientSetting) {
      setLogo(clientSetting?.logo)
    }
  }, [clientSettingState?.updateNeeded?.value])

  return (
    <div className="logo">
      <img
        src={logo || Config.publicRuntimeConfig.logo}
        alt="logo"
        crossOrigin="anonymous"
        className="logo"
        onClick={props.onClick ?? null}
      />
    </div>
  )
}

export default Logo
