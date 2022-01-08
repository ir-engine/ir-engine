import React from 'react'

import { AuthService } from '../../../user/services/AuthService'
import BotsCore from '../../components/Bots'

interface Props {}

const Bots = (props: Props) => {
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <BotsCore />
}

export default Bots
