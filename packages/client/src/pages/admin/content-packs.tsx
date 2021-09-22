import ContentPackConsole from '@xrengine/client-core/src/admin/components/ContentPack/ContentPackConsole'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

interface Props {}

function ContentPacks(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])
  return <ContentPackConsole />
}

export default ContentPacks
