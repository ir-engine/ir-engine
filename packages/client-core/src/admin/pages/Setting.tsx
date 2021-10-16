import SettingConsole from '../components/Setting'
import { AuthService } from '../../user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

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
