import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { ClientNetworkingSystem } from '@etherealengine/client-core/src/networking/ClientNetworkingSystem'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { ClientSystems } from '@etherealengine/client-core/src/world/ClientSystems'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import {
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import EditorContainer from '../components/EditorContainer'
import { EditorInstanceNetworkingSystem } from '../components/realtime/EditorInstanceNetworkingSystem'
import { RenderInfoSystem } from '../components/toolbar/tools/StatsTool'
import { EditorAction, useEditorState } from '../services/EditorServices'
import { registerEditorReceptors, unregisterEditorReceptors } from '../services/EditorServicesReceptor'
import { EditorCameraSystem } from '../systems/EditorCameraSystem'
import { EditorControlSystem } from '../systems/EditorControlSystem'
import { EditorFlyControlSystem } from '../systems/EditorFlyControlSystem'
import { GizmoSystem } from '../systems/GizmoSystem'
import { ModelHandlingSystem } from '../systems/ModelHandlingSystem'

const editorSystems = () => {
  startSystems([EditorFlyControlSystem, EditorControlSystem, EditorCameraSystem, GizmoSystem], {
    before: PresentationSystemGroup
  })
  startSystems([ModelHandlingSystem], { with: SimulationSystemGroup })

  startSystems([EditorInstanceNetworkingSystem, ClientNetworkingSystem, RenderInfoSystem], {
    after: PresentationSystemGroup
  })
}

export const EditorPage = () => {
  const params = useParams()
  const projectState = useProjectState()
  const editorState = useEditorState()
  const isEditor = useHookstate(getMutableState(EngineState).isEditor)
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const [isAuthenticated, setAuthenticated] = useState(false)
  const [clientInitialized, setClientInitialized] = useState(false)
  const [engineReady, setEngineReady] = useState(true)

  useEffect(() => {
    // TODO: This is a hack to prevent the editor from loading the engine twice
    if (isEditor.value) return
    isEditor.set(true)
    const projects = Engine.instance.api.service('projects').find()
    ClientSystems()

    editorSystems()
    projects.then((proj) => {
      loadEngineInjection(proj).then(() => {
        setEngineReady(true)
        dispatchAction(EngineActions.initializeEngine({ initialised: true }))
      })
    })
  }, [])

  useEffect(() => {
    registerEditorReceptors()
    return () => {
      unregisterEditorReceptors()
    }
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

  return (
    <>{clientInitialized && editorState.projectName.value && isAuthenticated && engineReady && <EditorContainer />}</>
  )
}
