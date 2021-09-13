import ScenesConsole from '@xrengine/client-core/src/admin/components/Scenes'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/service'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

interface Props {}

function scenes(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <ScenesConsole />
}

export default scenes
