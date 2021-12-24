import Analytics from '../components/Analytics/index'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'

interface Props {}

const AdminConsolePage = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <Analytics />
}

export default AdminConsolePage
