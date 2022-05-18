import GroupsConsole from '../components/Group'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function Groups(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <GroupsConsole />
}

export default Groups
