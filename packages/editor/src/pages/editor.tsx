import React, { Suspense, useEffect, useState } from 'react'
import Projects from '@xrengine/editor/src/pages/projects'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { useEditorState } from '../services/EditorServices'
import { Route, Switch } from 'react-router-dom'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

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
        args: { enabled: true, canvas: document.getElementById(engineRendererCanvasId) }
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
