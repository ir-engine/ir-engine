import React from 'react'
import BotsCore from '../../components/Bots'
import { AuthService } from '../../../user/services/AuthService'
import { useDispatch } from '../../../store'

interface Props {}

const Bots = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return <BotsCore />
}

export default Bots
