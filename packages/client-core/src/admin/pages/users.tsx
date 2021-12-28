import UserConsole from '../components/Users'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function users(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <UserConsole />
}

export default users
