import React, { Suspense, useEffect } from 'react'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'

interface Props {}

/**
 * Scene editor
 * @returns
 */

const SceneEditor = (props: Props) => {
  console.log(props)
  // initialising consts using props interface.
  const authState = useAuthState()
  // initialising authUser.
  const authUser = authState.authUser
  // initialising authState.
  const user = authState.user

  // setting doLoginAuto true once DOM get rendered or get updated..
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  return (
    <Suspense fallback={React.Fragment}>
      {authUser?.accessToken.value != null &&
        authUser.accessToken.value.length > 0 &&
        user?.id.value != null &&
        <EditorContainer />}
    </Suspense>
  )
}

export default SceneEditor
