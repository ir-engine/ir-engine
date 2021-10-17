import PartyCore from '../components/Party'
import { AuthService } from '../../user/state/AuthService'
import React from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

interface Props {}

const Party = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])
  return <PartyCore />
}

export default Party
