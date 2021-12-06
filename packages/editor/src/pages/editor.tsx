import React, { Suspense, useEffect, useState } from 'react'
import Projects from '@xrengine/editor/src/pages/projects'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { useEditorState } from '../services/EditorServices'
import { Route, Switch } from 'react-router-dom'
import { useDispatch } from '@xrengine/client-core/src/store'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

const EditorProtectedRoutes = () => {
  const [engineIsInitialized, setEngineInitialized] = useState(false)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const dispatch = useDispatch()

  const editorState = useEditorState()

  const initializationOptions: InitializeOptions = {
    type: EngineSystemPresets.EDITOR,
    publicPath: location.origin
  }

  useEffect(() => {
    AuthService.doLoginAuto(false)
    initializeEngine(initializationOptions).then(() => {
      console.log('Setting engine inited')
      registerSystem(SystemUpdateType.PRE_RENDER, import('../managers/SceneManager'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('../systems/InputSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('../systems/FlyControlSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('../systems/EditorControlSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('../systems/EditorCameraSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('../systems/ResetInputSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('../systems/GizmoSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/RenderSettingSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/SkySystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/EnvmapSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/FogSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/LightSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/GroundPlanSystem'))
      registerSystem(SystemUpdateType.PRE_RENDER, import('@xrengine/engine/src/scene/systems/ShadowSystem'))

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

  // const projectReroute = (props) => {
  //   if (props?.match?.params?.projectName) dispatch(EditorAction.projectLoaded(props?.match?.params?.projectName))
  //   if (props?.match?.params?.sceneName) dispatch(EditorAction.sceneLoaded(props?.match?.params?.sceneName))
  //   useEffect(() => {
  //     props.history.push('/editor')
  //   }, [])
  //   return <></>
  // }

  return (
    <>
      <Suspense fallback={React.Fragment}>
        <Switch>
          <Route path="/editor/:projectName/:sceneName" component={editorRoute} />
          <Route path="/editor/:projectName" component={editorRoute} />
          <Route path="/editor" component={editorRoute} />
        </Switch>
      </Suspense>
    </>
  )
}

export default EditorProtectedRoutes
