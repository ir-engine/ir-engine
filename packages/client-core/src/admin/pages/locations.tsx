import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import AdminConsole from '../components/Location'

interface Props {}

function locations(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <AdminConsole />
}

export default locations
