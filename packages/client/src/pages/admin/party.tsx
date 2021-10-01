import PartyCore from '@xrengine/client-core/src/admin/components/Party'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { useDispatch } from 'react-redux'

interface Props {}

const Party = (props: Props) => {
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
  }, [])

  return <PartyCore />
}

export default Party
