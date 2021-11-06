import React, { Suspense, useEffect, useState } from 'react'
import Projects from '@xrengine/editor/src/pages/projects'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { useEditorState } from '../services/EditorServices'

const EditorProtectedRoutes = () => {
  const [engineIsInitialized, setEngineInitialized] = useState(false)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user

  const editorState = useEditorState()
  console.log(editorState.projectName.value)

  const initializationOptions: InitializeOptions = {
    type: EngineSystemPresets.EDITOR,
    publicPath: location.origin
  }

  useEffect(() => {
    AuthService.doLoginAuto(false)
    initializeEngine(initializationOptions).then(() => {
      console.log('Setting engine inited')
      setEngineInitialized(true)
    })
  }, [])

  return (
    <>
      <Suspense fallback={React.Fragment}>
        {editorState.projectName.value ? (
          authUser?.accessToken.value != null &&
          authUser.accessToken.value.length > 0 &&
          user?.id.value != null &&
          engineIsInitialized && <EditorContainer />
        ) : (
          <Projects />
        )}
      </Suspense>
    </>
  )
}

export default EditorProtectedRoutes
