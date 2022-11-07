import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'

import { API } from '@xrengine/client-core/src/API'
import { useRouter } from '@xrengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import PortalLoadSystem from '@xrengine/client-core/src/systems/PortalLoadSystem'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { initializeCoreSystems } from '@xrengine/engine/src/initializeCoreSystems'
import { initializeRealtimeSystems } from '@xrengine/engine/src/initializeRealtimeSystems'
import { initializeSceneSystems } from '@xrengine/engine/src/initializeSceneSystems'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'

import EditorCameraSystem from '../systems/EditorCameraSystem'
import EditorControlSystem from '../systems/EditorControlSystem'
import FlyControlSystem from '../systems/FlyControlSystem'
import GizmoSystem from '../systems/GizmoSystem'
import InputSystem from '../systems/InputSystem'
import ModelHandlingSystem from '../systems/ModelHandlingSystem'
import RenderSystem from '../systems/RenderSystem'
import ResetInputSystem from '../systems/ResetInputSystem'
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
    uuid: 'core.editor.InputSystem',
    systemLoader: () => Promise.resolve({ default: InputSystem }),
    type: SystemUpdateType.PRE_RENDER,
    args: { enabled: true }
  },
  {
    uuid: 'core.editor.FlyControlSystem',
    systemLoader: () => Promise.resolve({ default: FlyControlSystem }),
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
    uuid: 'core.editor.ResetInputSystem',
    systemLoader: () => Promise.resolve({ default: ResetInputSystem }),
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
    initializeCoreSystems().then(async () => {
      initSystems(world, systems)
      const projects = API.instance.client.service('projects').find()
      await initializeRealtimeSystems(false)
      await initializeSceneSystems()
      await loadEngineInjection(world, await projects)
      setEngineReady(true)
    })
  }, [])

  if (!isAuthorized || !engineReady) return <LoadingCircle />

  return (
    <Suspense fallback={<LoadingCircle />}>
      <Switch>
        <Route path="/editor/:projectName/:sceneName" component={EditorPage} />
        <Route path="/editor/:projectName" component={EditorPage} />
        <Route path="/editor" component={ProjectPage} />
        {/* Not in use */}
        <Route path="/editor-login" component={SignInPage} />
      </Switch>
    </Suspense>
  )
}

export default EditorProtectedRoutes
