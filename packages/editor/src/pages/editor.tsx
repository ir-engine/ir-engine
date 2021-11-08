import React, { Suspense, useEffect, useState } from 'react'
import Projects from '@xrengine/editor/src/pages/projects'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { EditorAction, useEditorState } from '../services/EditorServices'
import { Route, Switch } from 'react-router-dom'
import { useDispatch } from '@xrengine/client-core/src/store'

const EditorProtectedRoutes = () => {
  const [engineIsInitialized, setEngineInitialized] = useState(false)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const dispatch = useDispatch()

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

  const editorRoute = () => (
    <>
      {editorState.projectName.value ? (
        authUser?.accessToken.value != null &&
        authUser.accessToken.value.length > 0 &&
        user?.id.value != null &&
        engineIsInitialized && <EditorContainer />
      ) : (
        <Projects />
      )}
    </>
  )

  const projectReroute = (props) => {
    if (props?.match?.params?.projectName) dispatch(EditorAction.projectLoaded(props?.match?.params?.projectName))
    if (props?.match?.params?.sceneName) dispatch(EditorAction.sceneLoaded(props?.match?.params?.sceneName))
    useEffect(() => {
      props.history.push('/editor')
    }, [])
    return <></>
  }

  return (
    <>
      <Suspense fallback={React.Fragment}>
        <Switch>
          <Route path="/editor/:projectName/:sceneName" component={projectReroute} />
          <Route path="/editor/:projectName" component={projectReroute} />
          <Route path="/editor" component={editorRoute} />
        </Switch>
      </Suspense>
    </>
  )
}

export default EditorProtectedRoutes
