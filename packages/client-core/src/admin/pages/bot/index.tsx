import React from 'react'
import BotsCore from '../../components/Bots'
import { AuthService } from '../../../user/state/AuthService'
import { useDispatch } from '@xrengine/client-core/src/store'

interface Props {}

const Bots = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <BotsCore />
}

export default Bots
