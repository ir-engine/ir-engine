import AvatarConsole from '../components/Avatars/Avatars'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function avatars(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <AvatarConsole />
}

export default avatars
