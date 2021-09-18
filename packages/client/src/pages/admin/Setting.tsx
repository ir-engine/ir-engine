import SettingConsole from '@xrengine/client-core/src/admin/components/Setting'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'

interface Props {
  //doLoginAuto?: any
}

const Setting = (props: Props) => {
  const {} = props

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <SettingConsole />
}

export default Setting
