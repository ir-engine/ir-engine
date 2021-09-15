import React from 'react'
import BotsCore from '@xrengine/client-core/src/admin/components/Bots'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { useDispatch } from 'react-redux'

interface Props {}

const Bots = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
  }, [])

  return <BotsCore />
}

export default Bots
