import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import GroupsConsole from '../components/Group'

interface Props {}

function Groups(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <GroupsConsole />
}

export default Groups
