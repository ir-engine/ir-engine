import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import UserConsole from '../components/Users'

interface Props {}

function users(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <UserConsole />
}

export default users
