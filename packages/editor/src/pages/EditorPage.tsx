import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { API } from '@xrengine/client-core/src/API'
import { useProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import {
  initializeCoreSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { dispatchAction } from '@xrengine/hyperflux'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'

import EditorContainer from '../components/EditorContainer'
import { EditorAction, useEditorState } from '../services/EditorServices'
import { registerEditorReceptors } from '../services/EditorServicesReceptor'

const systems = [
  {
    uuid: 'core.editor.RenderSystem',
    systemLoader: () => import('../systems/RenderSystem'),
    type: SystemUpdateType.POST_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.InputSystem',
    systemLoader: () => import('../systems/InputSystem'),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.FlyControlSystem',
    systemLoader: () => import('../systems/FlyControlSystem'),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.EditorControlSystem',
    systemLoader: () => import('../systems/EditorControlSystem'),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.EditorCameraSystem',
    systemLoader: () => import('../systems/EditorCameraSystem'),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.ResetInputSystem',
    systemLoader: () => import('../systems/ResetInputSystem'),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.GizmoSystem',
    systemLoader: () => import('../systems/GizmoSystem'),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.PortalLoadSystem',
    systemLoader: () => import('@xrengine/client-core/src/systems/PortalLoadSystem'),
    type: SystemUpdateType.FIXED,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.ModelHandlingSystem',
    systemLoader: () => import('../systems/ModelHandlingSystem'),
    type: SystemUpdateType.FIXED,
    args: { enabled: true }
  }
]

export const EditorPage = (props: RouteComponentProps<{ sceneName: string; projectName: string }>) => {
  const editorState = useEditorState()
  const projectState = useProjectState()
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const [clientInitialized, setClientInitialized] = useState(false)
  const [engineReady, setEngineReady] = useState(false)
  const [isAuthenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    registerEditorReceptors()
  }, [])

  useEffect(() => {
    const _isAuthenticated =
      authUser.accessToken.value != null && authUser.accessToken.value.length > 0 && user.id.value != null

    if (isAuthenticated !== _isAuthenticated) setAuthenticated(_isAuthenticated)
  }, [authUser.accessToken, user.id, isAuthenticated])

  useEffect(() => {
    if (engineReady) {
      const { projectName, sceneName } = props.match.params
      dispatchAction(EditorAction.projectChanged({ projectName: projectName ?? null }))
      dispatchAction(EditorAction.sceneChanged({ sceneName: sceneName ?? null }))
    }
  }, [engineReady, props.match.params.projectName, props.match.params.sceneName])

  useEffect(() => {
    if (clientInitialized || projectState.projects.value.length <= 0) return
    setClientInitialized(true)
    Engine.instance.isEditor = true
    const world = Engine.instance.currentWorld
    initializeCoreSystems().then(async () => {
      initSystems(world, systems)
      const projects = API.instance.client.service('projects').find()
      await initializeRealtimeSystems(false)
      await initializeSceneSystems()
      await loadEngineInjection(world, await projects)
      setEngineReady(true)
    })
  }, [projectState.projects.value])

  return <>{engineReady && editorState.projectName.value && isAuthenticated && <EditorContainer />}</>
}
