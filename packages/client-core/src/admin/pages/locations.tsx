import AdminConsole from '../components/Location'
import { AuthService } from '../../user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

interface Props {}

function locations(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <AdminConsole />
}

export default locations
