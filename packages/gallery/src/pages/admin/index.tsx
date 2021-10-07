/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import Dashboard from '@xrengine/social/src/components/Dashboard'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import AdminLogin from '../../components/AdminLogin'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'

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
    dispatch(AuthService.doLoginAuto(true))
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
