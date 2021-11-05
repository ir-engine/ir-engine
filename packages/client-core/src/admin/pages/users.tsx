import UserConsole from '../components/Users'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

function users(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <UserConsole />
}

export default users
