import Analytics from '@xrengine/client-core/src/admin/components/Analytics/index'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

interface Props {}

const AdminConsolePage = (props: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  return <Analytics />
}

export default AdminConsolePage
