import React from 'react'
import BotsCore from '../../components/Bots'
import { AuthService } from '../../../user/services/AuthService'

interface Props {}

const Bots = (props: Props) => {
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <BotsCore />
}

export default Bots
