import GroupsConsole from '@xrengine/client-core/src/admin/components/Group'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

interface Props {}

function Groups(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])
  return <GroupsConsole />
}

export default Groups
