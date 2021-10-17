import AvatarConsole from '../components/Avatars/Avatars'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

interface Props {}

function avatars(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <AvatarConsole />
}

export default avatars
