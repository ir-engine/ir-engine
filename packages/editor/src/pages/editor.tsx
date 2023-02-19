import React, { Suspense, useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { useRouter } from '@xrengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'

import { EditorPage } from './EditorPage'
import { ProjectPage } from './ProjectPage'
import { SignInPage } from './SignInPage'

const EditorProtectedRoutes = () => {
  const authState = useAuthState()
  const route = useRouter()
  const user = authState.user
  const [isAuthorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (user.scopes.value) {
      const hasAccess = userHasAccess('editor:write')
      if (!hasAccess) {
        route('/')
        setAuthorized(false)
      } else setAuthorized(true)
    }
  }, [user.scopes])

  if (!isAuthorized) return <LoadingCircle />

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
