import Analytics from '../components/Analytics/index'
import { AuthService } from '../../user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

interface Props {}

const AdminConsolePage = (props: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <Analytics />
}

export default AdminConsolePage
