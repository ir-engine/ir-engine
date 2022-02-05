import RoutesConsole from '../components/Routes'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function locations(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <RoutesConsole />
}

export default locations
