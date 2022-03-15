import React, { useEffect } from 'react'

import { AuthService } from '../../../user/services/AuthService'
import BotsCore from '../../components/Bots'

interface Props {}

const Bots = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <BotsCore />
}

export default Bots
