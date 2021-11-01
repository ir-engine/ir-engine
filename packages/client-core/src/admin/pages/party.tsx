import PartyCore from '../components/Party'
import { AuthService } from '../../user/services/AuthService'
import React from 'react'
import { useDispatch } from '../../store'

interface Props {}

const Party = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])
  return <PartyCore />
}

export default Party
