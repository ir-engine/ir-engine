import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import AvatarConsole from '../components/Avatars/Avatars'

interface Props {}

function avatars(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <AvatarConsole />
}

export default avatars
