import React, { useEffect } from 'react'

import { AuthService } from '../../user/services/AuthService'
import Analytics from '../components/Analytics/index'

interface Props {}

const AdminConsolePage = (props: Props) => {
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <Analytics />
}

export default AdminConsolePage
