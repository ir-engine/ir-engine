import React, { Suspense, useEffect, useRef, useState } from 'react'
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
import * as styles from '../components/viewport/Viewport.module.scss'
import { SceneManager } from '../managers/SceneManager'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

const engineRendererCanvasId = 'engine-renderer-canvas'

const canvasStyle = {
  zIndex: -10000,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

const canvas = <canvas id={engineRendererCanvasId} style={canvasStyle} />

const EditorProtectedRoutes = () => {
  const canvasRef = useRef<HTMLCanvasElement>()
  const [engineIsInitialized, setEngineInitialized] = useState(false)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const dispatch = useDispatch()

  const editorState = useEditorState()

  const initializationOptions: InitializeOptions = {
    type: EngineSystemPresets.EDITOR,
    publicPath: location.origin,
    systems: [
      {
        systemModulePromise: import('../managers/SceneManager'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      },
      {
        systemModulePromise: import('../systems/InputSystem'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      },
      {
        systemModulePromise: import('../systems/FlyControlSystem'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      },
      {
        systemModulePromise: import('../systems/EditorControlSystem'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      },
      {
        systemModulePromise: import('../systems/EditorCameraSystem'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      },
      {
        systemModulePromise: import('../systems/ResetInputSystem'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      },
      {
        systemModulePromise: import('../systems/GizmoSystem'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true }
      }
    ]
  }

  useEffect(() => {
    AuthService.doLoginAuto(false)
    initializeEngine(initializationOptions).then(() => {
      new EngineRenderer({ canvas: canvasRef.current!, enabled: true })
      Engine.engineTimer.start()
      console.log('Setting engine inited')
      setEngineInitialized(true)
    })
  }, [])

  const editorRoute = () => (
    <>
      <img style={{ opacity: 0.2 }} className={styles.viewportBackgroundImage} src="/static/xrengine.png" />
      {canvas}
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
