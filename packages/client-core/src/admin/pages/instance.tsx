import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import InstanceConsole from '../components/Instance'

interface Props {}

function Instance(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <InstanceConsole />
}

export default Instance
