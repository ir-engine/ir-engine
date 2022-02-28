import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import InvitesConsole from '../components/Invite/index'

interface Props {}

function Groups(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <InvitesConsole />
}

export default Groups
