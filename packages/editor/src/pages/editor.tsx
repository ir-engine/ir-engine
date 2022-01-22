import React, { Suspense, useEffect, useState } from 'react'
import Projects from '@xrengine/editor/src/pages/projects'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import EditorContainer from '../components/EditorContainer'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import {
  createEngine,
  initializeBrowser,
  initializeCoreSystems,
  initializeProjectSystems
} from '@xrengine/engine/src/initializeEngine'
import { useEditorState } from '../services/EditorServices'
import { Route, Switch } from 'react-router-dom'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { useProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

const engineRendererCanvasId = 'engine-renderer-canvas'

const EditorProtectedRoutes = () => {
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const editorState = useEditorState()
  const engineState = useEngineState()
  const projectState = useProjectState()
  const [clientInitialized, setClientInitialized] = useState(false)

  const canvasStyle = {
    zIndex: -1,
    width: '100%',
    height: '100%',
    position: 'fixed',
    WebkitUserSelect: 'none',
    pointerEvents: 'auto',
    userSelect: 'none',
    visibility: editorState.projectName.value ? 'visible' : 'hidden'
  } as React.CSSProperties

  const canvas = <canvas id={engineRendererCanvasId} style={canvasStyle} />

  const systems = [
    {
      systemModulePromise: import('../managers/SceneManager'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true, canvas: document.getElementById(engineRendererCanvasId) }
    },
    {
      systemModulePromise: import('../systems/InputSystem'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      systemModulePromise: import('../systems/FlyControlSystem'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      systemModulePromise: import('../systems/EditorControlSystem'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      systemModulePromise: import('../systems/EditorCameraSystem'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      systemModulePromise: import('../systems/ResetInputSystem'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      systemModulePromise: import('../systems/GizmoSystem'),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      systemModulePromise: import('@xrengine/engine/src/scene/systems/EntityNodeEventSystem'),
      type: SystemUpdateType.PRE_RENDER
    },
    // {
    //   type: SystemUpdateType.PRE_RENDER,
    //   systemModulePromise: import('@xrengine/engine/src/debug/systems/DebugHelpersSystem')
    // },
    {
      type: SystemUpdateType.FIXED_LATE,
      systemModulePromise: import('@xrengine/engine/src/physics/systems/PhysicsSystem')
    }
  ]

  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  useEffect(() => {
    if (!clientInitialized && projectState.projects.value.length > 0) {
      setClientInitialized(true)
      Engine.userId = 'editor' as UserId
      Engine.isEditor = true
      createEngine()
      initializeBrowser()
      initializeCoreSystems(systems).then(() => {
        const projects = projectState.projects.value.map((project) => project.name)
        initializeProjectSystems(projects)
      })
    }
  }, [projectState.projects.value])

  const editorRoute = () => (
    <>
      {editorState.projectName.value ? (
        authUser?.accessToken.value != null &&
        authUser.accessToken.value.length > 0 &&
        user?.id.value != null &&
        engineState.isEngineInitialized.value && <EditorContainer />
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
