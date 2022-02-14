import AvatarConsole from '../components/Avatars'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

const Avatars = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <AvatarConsole />
}

export default Avatars
