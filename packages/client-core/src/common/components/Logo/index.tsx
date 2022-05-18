import React, { useEffect, useState } from 'react'

import { ClientSettingService } from '../../../admin/services/Setting/ClientSettingService'
import { useClientSettingState } from '../../../admin/services/Setting/ClientSettingService'

interface Props {
  onClick?: () => void
}

const Logo = (props: Props): JSX.Element => {
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
      <img src={logo} alt="logo" crossOrigin="anonymous" className="logo" onClick={props.onClick} />
    </div>
  )
}

export default Logo
