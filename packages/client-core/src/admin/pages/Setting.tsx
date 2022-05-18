import SettingConsole from '../components/Setting'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

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
