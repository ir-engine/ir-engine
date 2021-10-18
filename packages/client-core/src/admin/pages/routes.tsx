import RoutesConsole from '../components/Routes'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

function locations(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <RoutesConsole />
}

export default locations
