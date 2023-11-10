/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadEngineInjection } from '@etherealengine/projects/loadEngineInjection'

import { projectsPath } from '@etherealengine/engine/src/schemas/projects/projects.schema'
import EditorContainer from '../components/EditorContainer'
import { EditorState } from '../services/EditorServices'

const useEditorSystems = () => {
  // useSystems([EditorFlyControlSystem, EditorControlSystem, EditorCameraSystem, GizmoSystem], {
  //   before: PresentationSystemGroup
  // })
  // useSystems([ModelHandlingSystem, UploadRequestSystem], { with: SimulationSystemGroup })
  // // useSystems([EditorInstanceNetworkingSystem, ClientNetworkingSystem, RenderInfoSystem], {
  //   after: PresentationSystemGroup
  // })
}

export const useStudioEditor = () => {
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    if (engineReady) return
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).isEditing.set(true)
    const projects = Engine.instance.api.service(projectsPath).find()

    if (engineReady) return
    projects.then((proj) => {
      loadEngineInjection(proj).then(() => {
        setEngineReady(true)
      })
    })
  }, [])

  useEditorSystems()

  return engineReady
}

export const EditorPage = () => {
  const params = useParams()
  const projectState = useHookstate(getMutableState(ProjectState))
  const editorState = useHookstate(getMutableState(EditorState))

  useEffect(() => {
    const { projectName, sceneName } = params
    getMutableState(EditorState).merge({ projectName: projectName ?? null, sceneName: sceneName ?? null })
  }, [params])

  return <>{projectState.projects.value.length && editorState.projectName.value && <EditorContainer />}</>
}
