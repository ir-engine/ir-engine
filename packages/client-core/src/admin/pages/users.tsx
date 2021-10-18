import UserConsole from '../components/Users'
import { AuthService } from '../../user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

interface Props {}

function users(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
  }, [])

  return <UserConsole />
}

export default users
