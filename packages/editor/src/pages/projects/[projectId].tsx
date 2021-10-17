/**
 *Compoment to render existing project on the basis of projectId.
 *@Param :- projectId
 */

import React, { lazy, Suspense, useEffect, useState } from 'react'

// importing component EditorContainer.
const EditorContainer = lazy(() => import('../../components/EditorContainer'))

import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'

/**
 * Declaring Props interface having two props.
 *@authState can be of any type.
 *@doLoginAuto can be of type doLoginAuto component.
 *
 */
interface Props {}

/**
 * Function component providing project editor view.
 */
const Project = (props: Props) => {
  // initialising consts using props interface.
  const dispatch = useDispatch()
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

export default Project
