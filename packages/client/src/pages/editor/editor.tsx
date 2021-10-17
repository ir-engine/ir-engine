import React, { useEffect, useState } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useDispatch } from 'react-redux'
const editorProject = React.lazy(() => import('@xrengine/editor/src/pages/projects'))
//@ts-ignore
const editorProjID = React.lazy(() => import('@xrengine/editor/src/pages/projects/[projectId]'))
const editorCreate = React.lazy(() => import('@xrengine/editor/src/pages/create'))
const UnauthorisedPage = React.lazy(() => import('../403/403'))
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'

const unauthorisedMessage = `The page you are looking for is eligible for authorised users only.`
const loggingInMessage = `Authorising...`

const EditorProtectedRoutes = () => {
  const dispatch = useDispatch()
  const scopes = useAuthState().user?.scopes?.value || []
  const isSceneAllowed = userHasAccess('editor:write')
  console.log(isSceneAllowed)
  const authState = useAuthState()
  const [pendingAuth, setPendingAuth] = useState(true)

  let message = !scopes.length && !pendingAuth ? unauthorisedMessage : loggingInMessage

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
  }, [])

  useEffect(() => {
    setPendingAuth(authState.isLoggedIn.value)
  }, [authState.isLoggedIn.value])

  return (
    <Switch>
      {isSceneAllowed ? (
        <>
          <Route exact path="/editor/projects/:projectId" component={editorProjID} />
          <Route exact path="/editor/projects" component={editorProject} />
          <Route exact path="/editor/create" component={editorCreate} />
        </>
      ) : (
        <>
          <Route exact path="/editor/projects/:projectId" render={() => <UnauthorisedPage message={message} />} />
          <Route exact path="/editor/projects" render={() => <UnauthorisedPage message={message} />} />
          <Route exact path="/editor/create" render={() => <UnauthorisedPage message={message} />} />
        </>
      )}
    </Switch>
  )
}

export default EditorProtectedRoutes
