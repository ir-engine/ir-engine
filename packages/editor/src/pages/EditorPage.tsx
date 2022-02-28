import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { useProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import {
  createEngine,
  initializeBrowser,
  initializeCoreSystems,
  initializeProjectSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'

import EditorContainer from '../components/EditorContainer'
import { EditorAction, useEditorState } from '../services/EditorServices'

const engineRendererCanvasId = 'engine-renderer-canvas'

export const EditorPage = (props: RouteComponentProps<{ sceneName: string; projectName: string }>) => {
  const editorState = useEditorState()
  const projectState = useProjectState()
  const authState = useAuthState()
  const dispatch = useDispatch()
  const authUser = authState.authUser
  const user = authState.user
  const [clientInitialized, setClientInitialized] = useState(false)
  const [engineReady, setEngineReady] = useState(false)
  const [isAuthenticated, setAuthenticated] = useState(false)

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
      type: SystemUpdateType.POST_RENDER,
      args: { enabled: true }
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
    }
  ]

  useEffect(() => {
    const _isAuthenticated =
      authUser.accessToken.value != null && authUser.accessToken.value.length > 0 && user.id.value != null

    if (isAuthenticated !== _isAuthenticated) setAuthenticated(_isAuthenticated)
  }, [authUser.accessToken, user.id, isAuthenticated])

  useEffect(() => {
    const { projectName, sceneName } = props.match.params
    dispatch(EditorAction.projectChanged(projectName ?? null))
    dispatch(EditorAction.sceneChanged(sceneName ?? null))
  }, [props.match.params.projectName, props.match.params.sceneName])

  useEffect(() => {
    if (clientInitialized || projectState.projects.value.length <= 0) return
    setClientInitialized(true)
    Engine.userId = 'editor' as UserId
    Engine.isEditor = true
    createEngine()
    initializeBrowser()
    initializeCoreSystems(systems).then(async () => {
      await initializeSceneSystems()
      const projects = projectState.projects.value.map((project) => project.name)
      await initializeProjectSystems(projects)
      setEngineReady(true)
    })
  }, [projectState.projects.value])

  return (
    <>
      {canvas}
      {engineReady && editorState.projectName.value && isAuthenticated && <EditorContainer />}
    </>
  )
}
