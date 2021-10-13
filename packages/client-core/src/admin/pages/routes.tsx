import RoutesConsole from '@xrengine/client-core/src/admin/components/Routes'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

interface Props {}

function locations(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <RoutesConsole />
}

export default locations
