import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useDispatch } from 'react-redux'
const editorProject = React.lazy(() => import('@xrengine/editor/src/pages/projects'))
//@ts-ignore
const editorProjID = React.lazy(() => import('@xrengine/editor/src/pages/projects/[projectId]'))
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import FormDialog from '@xrengine/client-core/src/admin/components/UI/SubmitDialog'

const EditorProtectedRoutes = () => {
  const dispatch = useDispatch()
  const isSceneAllowed = userHasAccess('editor:write')

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(false))
  }, [])

  return (
    <>
      {isSceneAllowed ? (
        <Switch>
          <Route exact path="/editor/:projectId" component={editorProjID} />
          <Route exact path="/editor" component={editorProject} />
        </Switch>
      ) : (
        <FormDialog />
      )}
    </>
  )
}

export default EditorProtectedRoutes
