import RealityPacks from '@xrengine/client-core/src/admin/components/RealityPack/RealityPack'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

interface Props {}

function avatars(props: Props) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])
  return <RealityPacks />
}

export default avatars
