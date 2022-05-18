import AvatarConsole from '../components/Avatars/Avatars'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

function avatars(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <AvatarConsole />
}

export default avatars
