import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { API } from '@etherealengine/client-core/src/API'
import { useProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { ClientModules } from '@etherealengine/client-core/src/world/ClientModules'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { initSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import EditorContainer from '../components/EditorContainer'
import { EditorAction, useEditorState } from '../services/EditorServices'
import { registerEditorReceptors } from '../services/EditorServicesReceptor'
import EditorCameraSystem from '../systems/EditorCameraSystem'
import EditorControlSystem, { createTransformGizmo } from '../systems/EditorControlSystem'
import EditorFlyControlSystem from '../systems/EditorFlyControlSystem'
import GizmoSystem from '../systems/GizmoSystem'
import ModelHandlingSystem from '../systems/ModelHandlingSystem'

export const EditorPage = () => {
  const params = useParams()
  const editorState = useEditorState()
  const projectState = useProjectState()
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const [clientInitialized, setClientInitialized] = useState(false)
  const [isAuthenticated, setAuthenticated] = useState(false)

  const [engineReady, setEngineReady] = useState(true)

  const systems = [
    {
      uuid: 'core.editor.EditorFlyControlSystem',
      systemLoader: () => Promise.resolve({ default: EditorFlyControlSystem }),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      uuid: 'core.editor.EditorControlSystem',
      systemLoader: () => Promise.resolve({ default: EditorControlSystem }),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      uuid: 'core.editor.EditorCameraSystem',
      systemLoader: () => Promise.resolve({ default: EditorCameraSystem }),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      uuid: 'core.editor.GizmoSystem',
      systemLoader: () => Promise.resolve({ default: GizmoSystem }),
      type: SystemUpdateType.PRE_RENDER,
      args: { enabled: true }
    },
    {
      uuid: 'core.editor.ModelHandlingSystem',
      systemLoader: () => Promise.resolve({ default: ModelHandlingSystem }),
      type: SystemUpdateType.FIXED,
      args: { enabled: true }
    }
  ]

  useEffect(() => {
    getMutableState(EngineState).isEditor.set(true)
    const projects = API.instance.client.service('projects').find()
    ClientModules().then(async () => {
      await initSystems(systems)
      await loadEngineInjection(await projects)
      setEngineReady(true)
      dispatchAction(EngineActions.initializeEngine({ initialised: true }))
    })
  }, [])

  useEffect(() => {
    registerEditorReceptors()
  }, [])

  useEffect(() => {
    const _isAuthenticated =
      authUser.accessToken.value != null && authUser.accessToken.value.length > 0 && user.id.value != null

    if (isAuthenticated !== _isAuthenticated) setAuthenticated(_isAuthenticated)
  }, [authUser.accessToken, user.id, isAuthenticated])

  useEffect(() => {
    const { projectName, sceneName } = params
    dispatchAction(EditorAction.projectChanged({ projectName: projectName ?? null }))
    dispatchAction(EditorAction.sceneChanged({ sceneName: sceneName ?? null }))
  }, [params])

  useEffect(() => {
    if (clientInitialized || projectState.projects.value.length <= 0) return
    setClientInitialized(true)
  }, [projectState.projects.value])

  return <>{editorState.projectName.value && isAuthenticated && engineReady && <EditorContainer />}</>
}
