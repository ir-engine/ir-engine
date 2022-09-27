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

export const EditorPage = (props: RouteComponentProps<{ sceneName: string; projectName: string }>) => {
  const editorState = useEditorState()
  const projectState = useProjectState()
  const authState = useAuthState()
  const authUser = authState.authUser
  const user = authState.user
  const [clientInitialized, setClientInitialized] = useState(false)
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
    const { projectName, sceneName } = props.match.params
    dispatchAction(EditorAction.projectChanged({ projectName: projectName ?? null }))
    dispatchAction(EditorAction.sceneChanged({ sceneName: sceneName ?? null }))
  }, [props.match.params.projectName, props.match.params.sceneName])

  useEffect(() => {
    if (clientInitialized || projectState.projects.value.length <= 0) return
    setClientInitialized(true)
  }, [projectState.projects.value])

  return <>{editorState.projectName.value && isAuthenticated && <EditorContainer />}</>
}
