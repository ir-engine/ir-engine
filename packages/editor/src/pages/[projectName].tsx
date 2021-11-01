import React, { lazy, Suspense, useEffect, useState } from 'react'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import ErrorBoundary from '@xrengine/client-core/src/common/components/ErrorBoundary'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'

interface Props {}

/**
 * Scene editor
 * @returns
 */

const SceneEditor = (props: Props) => {
  // initialising consts using props interface.
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

  console.log(props)

  /**
   * validating user and rendering EditorContainer component.
   */
  return (
    hasMounted && (
      <Suspense fallback={React.Fragment}>
        {authUser?.accessToken.value != null &&
          authUser.accessToken.value.length > 0 &&
          user?.id.value != null &&
          engineIsInitialized && <EditorContainer {...props} />}
      </Suspense>
    )
  )
}

export default SceneEditor
