import React, { Suspense, useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
const editorProject = React.lazy(() => import('@xrengine/editor/src/pages/projects'))
const editorProjID = React.lazy(() => import('@xrengine/editor/src/pages/projects/[projectId]'))
const editorCreate = React.lazy(() => import('@xrengine/editor/src/pages/create'))
// TODO restore this?
// const UnauthorisedPage = React.lazy(() => import('@xrengine/client/src/pages/403/403'))
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'

interface Props {
  authState?: any
  doLoginAuto?: any
}

const mapStateToProps = (state: any): any => {
  return {
    // authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  //doLoginAuto: bindActionCreators(doLoginAuto, dispatch)
})

const EditorProtectedRoutes = (props: Props) => {
  //const { authState, doLoginAuto } = props

  const dispatch = useDispatch()
  const scopes = useAuthState().user?.scopes?.value || []
  let isSceneAllowed = false

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
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
      {/*{isSceneAllowed ? (*/}
      {/*  <Route exact path="/editor/projects" component={editorProject} />*/}
      {/*) : (*/}
      {/*  <Route exact path="/editor/projects" component={UnauthorisedPage} />*/}
      {/*)}*/}
      {/*{isSceneAllowed ? (*/}
      {/*  <Route exact path="/editor/create" component={editorCreate} />*/}
      {/*) : (*/}
      {/*  <Route exact path="/editor/create" component={UnauthorisedPage} />*/}
      {/*)}*/}
      <Redirect path="/editor" to="/editor/projects" />
    </Switch>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorProtectedRoutes)
