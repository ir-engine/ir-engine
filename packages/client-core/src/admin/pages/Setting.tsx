import SettingConsole from '../components/Setting'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

interface Props {
  //doLoginAuto?: any
}

const Setting = (props: Props) => {
  const {} = props

  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <SettingConsole />
}

export default Setting
