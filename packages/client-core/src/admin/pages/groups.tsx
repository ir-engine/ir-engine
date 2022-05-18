import GroupsConsole from '../components/Group'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

function Groups(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <GroupsConsole />
}

export default Groups
