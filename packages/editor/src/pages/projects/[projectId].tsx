/**
 *Compoment to render existing project on the basis of projectId.
 *@Param :- projectId
 */

import React, { lazy, Suspense, useEffect, useState } from 'react'

// importing component EditorContainer.
const EditorContainer = lazy(() => import('../../components/EditorContainer'))

import { useDispatch } from 'react-redux'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'

/**
 * Declaring Props interface having two props.
 *@authState can be of any type.
 *@doLoginAuto can be of type doLoginAuto component.
 *
 */
interface Props {
  //doLoginAuto?: typeof AuthService.doLoginAuto
}

/**
 * Function component providing project editor view.
 */
const Project = (props: Props) => {
  // initialising consts using props interface.
  //const {  doLoginAuto } = props
  const dispatch = useDispatch()
  const authState = useAuthState()
  // initialising authUser.
  const authUser = authState.authUser
  // initialising authState.
  const user = authState.user

  // setting doLoginAuto true once DOM get rendered or get updated..
  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
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
