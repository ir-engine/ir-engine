import InstanceConsole from '@xrengine/client-core/src/admin/components/Instance'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'

interface Props {}

function Instance(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])
  return <InstanceConsole />
}

export default Instance
