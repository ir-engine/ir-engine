import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import SettingConsole from '../components/Setting'

interface Props {
  //doLoginAuto?: any
}

const Setting = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <SettingConsole />
}

export default Setting
