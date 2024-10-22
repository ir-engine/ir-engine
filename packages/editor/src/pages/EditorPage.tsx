/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useUnsupported } from '@ir-engine/client-core/src/hooks/useUnsupported'
import '@ir-engine/engine/src/EngineModule'
import { getMutableState, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { loadEngineInjection } from '@ir-engine/projects/loadEngineInjection'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import '../EditorModule'
import EditorContainer from '../components/EditorContainer'
import { EditorState } from '../services/EditorServices'
import { ProjectPage } from './ProjectPage'

export const useStudioEditor = () => {
  const engineReady = useHookstate(false)

  useEffect(() => {
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).isEditing.set(true)
    loadEngineInjection().then(() => {
      engineReady.set(true)
    })
  }, [])

  return engineReady.value
}

export const EditorPage = () => {
  const [params] = useSearchParams()
  const { scenePath, projectName } = useHookstate(getMutableState(EditorState))

  useImmediateEffect(() => {
    const sceneInParams = params.get('scenePath')
    if (sceneInParams) scenePath.set(sceneInParams)
    const projectNameInParams = params.get('project')
    if (projectNameInParams) projectName.set(projectNameInParams)
  }, [params])

  useEffect(() => {
    if (!scenePath.value) return

    const parsed = new URL(window.location.href)
    const query = parsed.searchParams

    query.set('scenePath', scenePath.value)

    parsed.search = query.toString()
    if (typeof history.pushState !== 'undefined') {
      window.history.replaceState({}, '', parsed.toString())
    }
  }, [scenePath])

  useUnsupported({ device: true, browser: true })

  if (!scenePath.value && !projectName.value) return <ProjectPage studioPath="/studio" />

  return <EditorContainer />
}
