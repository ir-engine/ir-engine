/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { EmptyLayout } from '@xrengine/client-core/src/common/components/Layout/EmptyLayout'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { selectInstanceConnectionState } from '@xrengine/client/src/reducers/instanceConnection/selector'
import Dashboard from '@xrengine/social/src/components/Dashboard'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { useTranslation } from 'react-i18next'
import AdminLogin from '../../components/AdminLogin'
import { useAuthState } from '../../../../client-core/src/user/reducers/auth/AuthState'

interface Props {
  instanceConnectionState?: any
  //doLoginAuto?: any
  //authState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state)
    //authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  //doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const AdminPage = (props: Props) => {
  const {} = props

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

export default connect(mapStateToProps, mapDispatchToProps)(AdminPage)
