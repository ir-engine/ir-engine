import React, { useEffect, useState } from 'react'
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
    !clientSetting && ClientSettingService.fetchClientSettings()
  }, [])

  useEffect(() => {
    if (clientSetting) {
      setLogo(clientSetting?.logo)
    }
  }, [clientSettingState?.updateNeeded?.value])

  return (
    <div className="logo">
      <img src={logo} alt="logo" crossOrigin="anonymous" className="logo" onClick={props.onClick ?? null} />
    </div>
  )
}

export default Logo
