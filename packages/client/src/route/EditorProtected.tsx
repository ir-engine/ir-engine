import React, { Suspense, useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
const editorProject = React.lazy(() => import('@xrengine/editor/src/pages/projects'))
const editorProjID = React.lazy(() => import('@xrengine/editor/src/pages/projects/[projectId]'))
const editorCreate = React.lazy(() => import('@xrengine/editor/src/pages/create'))
const UnauthorisedPage = React.lazy(() => import('@xrengine/client/src/pages/403/403'))

interface Props {
  authState?: any
  doLoginAuto?: any
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const EditorProtectedRoutes = (props: Props) => {
  const { authState, doLoginAuto } = props
  const scopes = authState.get('user').scopes || []
  let isSceneAllowed = false

  useEffect(() => {
    doLoginAuto(false)
  }, [])

  for (const scope of scopes) {
    if (scope.type.split(':')[0] === 'editor' && scope.type.split(':')[1] === 'write') {
      isSceneAllowed = true
      break
    }
  }
  return (
    <Switch>
      {isSceneAllowed ? (
        <Route exact path="/editor/projects/:projectId" component={editorProjID} />
      ) : (
        <Route exact path="/editor/projects/:projectId" component={editorProjID} />
      )}
      {isSceneAllowed ? (
        <Route exact path="/editor/projects" component={editorProject} />
      ) : (
        <Route exact path="/editor/projects" component={UnauthorisedPage} />
      )}
      {isSceneAllowed ? (
        <Route exact path="/editor/create" component={editorCreate} />
      ) : (
        <Route exact path="/editor/create" component={UnauthorisedPage} />
      )}
      <Redirect path="/editor" to="/editor/projects" />
    </Switch>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorProtectedRoutes)
