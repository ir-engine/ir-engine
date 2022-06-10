import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'

import { EditorPage } from './EditorPage'
import { ProjectPage } from './ProjectPage'
import { SignInPage } from './SignInPage'

const EditorProtectedRoutes = () => {
  const authState = useAuthState()
  const history = useHistory()
  const user = authState.user
  const [isAuthorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (user.scopes.value && user.userRole.value) {
      const hasAccess = userHasAccess('editor:write')
      if (!hasAccess) {
        history.push('/')
        setAuthorized(false)
      } else setAuthorized(true)
    }
  }, [user.scopes, user.userRole])

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
