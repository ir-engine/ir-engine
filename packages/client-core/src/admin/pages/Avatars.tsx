import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import AvatarConsole from '../components/Avatars'

interface Props {}

const Avatars = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <AvatarConsole />
}

export default Avatars
