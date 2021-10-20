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
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'

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
  // initialising hasMounted to false.
  const [hasMounted, setHasMounted] = useState(false)

  const [engineIsInitialized, setEngineInitialized] = useState(false)

  const initializationOptions: InitializeOptions = {
    type: EngineSystemPresets.EDITOR,
    publicPath: location.origin
  }

  useEffect(() => {
    initializeEngine(initializationOptions).then(() => {
      console.log('Setting engine inited')
      setEngineInitialized(true)
    })
  }, [])

  // setting hasMounted true once DOM get rendered or get updated.
  useEffect(() => setHasMounted(true), [])

  // setting doLoginAuto true once DOM get rendered or get updated..
  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  /**
   * validating user and rendering EditorContainer component.
   */
  return (
    hasMounted && (
      <Suspense fallback={React.Fragment}>
        {authUser?.accessToken.value != null &&
        authUser.accessToken.value.length > 0 &&
        user?.id.value != null &&
        engineIsInitialized ? (
          <>
            {/* @ts-ignore */}
            <EditorContainer Engine={Engine} {...props} />
          </>
        ) : null}
      </Suspense>
    )
  )
}

export default Project
