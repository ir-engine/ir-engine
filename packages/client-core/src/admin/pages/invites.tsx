import InvitesConsole from '../components/Invite/index'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function Groups(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <InvitesConsole />
}

export default Groups
