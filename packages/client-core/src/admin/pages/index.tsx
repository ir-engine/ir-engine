import Analytics from '../components/Analytics/index'
import { AuthService } from '../../user/services/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '../../store'

interface Props {}

const AdminConsolePage = (props: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return <Analytics />
}

export default AdminConsolePage
