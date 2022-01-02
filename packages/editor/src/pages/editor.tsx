import React, { Suspense, useEffect, useRef, useState } from 'react'
import Projects from '@xrengine/editor/src/pages/projects'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { useEditorState } from '../services/EditorServices'
import { Route, Switch } from 'react-router-dom'
// import { useDispatch } from '@xrengine/client-core/src/store'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import * as styles from '../components/viewport/Viewport.module.scss'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

const engineRendererCanvasId = 'engine-renderer-canvas'

const canvasStyle = {
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'fixed',
  WebkitUserSelect: 'none',
  pointerEvents: 'auto',
  userSelect: 'none'
} as React.CSSProperties

const canvas = <canvas id={engineRendererCanvasId} style={canvasStyle} />

const EditorProtectedRoutes = () => {
  const [engineIsInitialized, setEngineInitialized] = useState(false)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const editorState = useEditorState()

  const initializationOptions: InitializeOptions = {
    type: EngineSystemPresets.EDITOR,
    publicPath: location.origin,
    systems: [
      {
        systemModulePromise: import('../managers/SceneManager'),
        type: SystemUpdateType.PRE_RENDER,
        sceneSystem: true,
        args: { enabled: true, canvas: canvasRef }
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
      new EngineRenderer({ canvas: document.querySelector('canvas')!, enabled: true })
      Engine.engineTimer.start()
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

  return (
    <div>
      {canvas}
      <Suspense fallback={React.Fragment}>
        <Switch>
          <Route path="/editor/:projectName/:sceneName" component={editorRoute} />
          <Route path="/editor/:projectName" component={editorRoute} />
          <Route path="/editor" component={editorRoute} />
        </Switch>
      </Suspense>
    </div>
  )
}

export default EditorProtectedRoutes
