import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import PartyCore from '../components/Party'

interface Props {}

const Party = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])
  return <PartyCore />
}

export default Party
