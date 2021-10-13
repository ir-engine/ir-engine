import AvatarConsole from '@xrengine/client-core/src/admin/components/Avatars/Avatars'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'

interface Props {}

function avatars(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])
  return <AvatarConsole />
}

export default avatars
