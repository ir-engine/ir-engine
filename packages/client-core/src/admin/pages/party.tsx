import PartyCore from '../components/Party'
import { AuthService } from '../../user/reducers/auth/AuthService'
import React from 'react'
import { useDispatch } from 'react-redux'

interface Props {}

const Party = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
  }, [])
  return <PartyCore />
}

export default Party
