import AdminConsole from '../components/Location'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function locations(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <AdminConsole />
}

export default locations
