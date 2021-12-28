import PartyCore from '../components/Party'
import { AuthService } from '../../user/services/AuthService'
import React from 'react'

interface Props {}

const Party = (props: Props) => {
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])
  return <PartyCore />
}

export default Party
