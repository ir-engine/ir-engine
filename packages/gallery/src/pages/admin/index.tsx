/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'
import Dashboard from '@xrengine/social/src/components/Dashboard'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useTranslation } from 'react-i18next'
import AdminLogin from '../../components/AdminLogin'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'

const AdminPage = () => {
  const authState = useAuthState()

  const dispatch = useDispatch()

  const { t } = useTranslation()
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    if (authState.user?.value) {
      setUserRole(authState.user?.userRole?.value)
    }
  }, [authState.user.value])

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return (
    <>
      <div>
        <Dashboard>
          <div />
        </Dashboard>
      </div>
    </>
  )
}

export default AdminPage
