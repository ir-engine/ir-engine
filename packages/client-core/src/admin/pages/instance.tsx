import InstanceConsole from '../components/Instance'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

function Instance(props: Props) {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])
  return <InstanceConsole />
}

export default Instance
