import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { registerEditorErrorServiceActions } from '../services/EditorErrorServices'
import { registerEditorHelperServiceActions } from '../services/EditorHelperState'
import { registerEditorServiceActions } from '../services/EditorServices'
import { registerEditorSelectionServiceActions } from '../services/SelectionServices'
import { EditorPage } from './EditorPage'
import { ProjectPage } from './ProjectPage'
import { SignInPage } from './SignInPage'

const EditorProtectedRoutes = () => {
  const authState = useAuthState()
  const history = useHistory()
  const user = authState.user
  const [isAuthorized, setAuthorized] = useState<boolean | null>(null)
  const [isInitialized, setInitialized] = useState(false)

  useEffect(() => {
    if (user.scopes.value && user.userRole.value) {
      const hasAccess = userHasAccess('editor:write')
      if (!hasAccess) {
        history.push('/')
        setAuthorized(false)
      } else setAuthorized(true)
    }
  }, [user.scopes, user.userRole])

  useEffect(() => {
    if (Engine.instance && !isInitialized) {
      registerEditorSelectionServiceActions()
      registerEditorErrorServiceActions()
      registerEditorHelperServiceActions()
      registerEditorServiceActions()
      setInitialized(true)
    }
  }, [Engine.instance])

  if (isAuthorized == null) return <div>Authorizing...</div>

  return (
    <Suspense fallback={React.Fragment}>
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
