import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import RoutesConsole from '../components/Routes'

interface Props {}

function locations(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <RoutesConsole />
}

export default locations
