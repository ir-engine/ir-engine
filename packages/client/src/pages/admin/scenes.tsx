import ScenesConsole from '@xrengine/client-core/src/admin/components/Scenes/index'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'

interface Props {}

function scenes(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <ScenesConsole />
}

export default scenes
