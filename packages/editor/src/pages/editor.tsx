import React, { Suspense, useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { API } from '@xrengine/client-core/src/API'
import { useRouter } from '@xrengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import PortalLoadSystem from '@xrengine/client-core/src/systems/PortalLoadSystem'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { ClientModules } from '@xrengine/client-core/src/world/ClientModules'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'

import EditorCameraSystem from '../systems/EditorCameraSystem'
import EditorControlSystem from '../systems/EditorControlSystem'
import EditorFlyControlSystem from '../systems/EditorFlyControlSystem'
import GizmoSystem from '../systems/GizmoSystem'
import ModelHandlingSystem from '../systems/ModelHandlingSystem'
import RenderSystem from '../systems/RenderSystem'
import { EditorPage } from './EditorPage'
import { ProjectPage } from './ProjectPage'
import { SignInPage } from './SignInPage'

const systems = [
  {
    uuid: 'core.editor.RenderSystem',
    systemLoader: () => Promise.resolve({ default: RenderSystem }),
    type: SystemUpdateType.POST_RENDER,
    args: { enabled: true }
  },
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
    uuid: 'core.editor.PortalLoadSystem',
    systemLoader: () => Promise.resolve({ default: PortalLoadSystem }),
    type: SystemUpdateType.FIXED,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.ModelHandlingSystem',
    systemLoader: () => Promise.resolve({ default: ModelHandlingSystem }),
    type: SystemUpdateType.FIXED,
    args: { enabled: true }
  }
]

const EditorProtectedRoutes = () => {
  const authState = useAuthState()
  const route = useRouter()
  const user = authState.user
  const [isAuthorized, setAuthorized] = useState<boolean | null>(null)
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    if (user.scopes.value) {
      const hasAccess = userHasAccess('editor:write')
      if (!hasAccess) {
        route('/')
        setAuthorized(false)
      } else setAuthorized(true)
    }
  }, [user.scopes])

  useEffect(() => {
    Engine.instance.isEditor = true
    const world = Engine.instance.currentWorld
    const projects = API.instance.client.service('projects').find()
    ClientModules().then(async () => {
      initSystems(world, systems)
      await loadEngineInjection(world, await projects)
      setEngineReady(true)
    })
  }, [])

  if (!isAuthorized || !engineReady) return <LoadingCircle />

  return (
    <Suspense fallback={<LoadingCircle />}>
      <Switch>
        <Redirect from="/editor/:projectName/:sceneName" to="/studio/:projectName/:sceneName" />
        <Redirect from="/editor/:projectName" to="/studio/:projectName" />
        <Redirect from="/editor" to="/studio" />
        <Route path="/studio/:projectName/:sceneName" component={EditorPage} />
        <Route path="/studio/:projectName" component={EditorPage} />
        <Route path="/studio" component={ProjectPage} />
        {/* Not in use */}
        <Route path="/studio-login" component={SignInPage} />
      </Switch>
    </Suspense>
  )
}

export default EditorProtectedRoutes
