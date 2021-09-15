import Analytics from '@xrengine/client-core/src/admin/components/Analytics/index'
import Dashboard from '@xrengine/client-core/src/user/components/Dashboard/Dashboard'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

interface Props {}

const AdminConsolePage = (props: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <Analytics />
}

export default AdminConsolePage
