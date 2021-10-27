import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
const editor = React.lazy(() => import('@xrengine/editor/src/pages/projects'))
//@ts-ignore
const sceneEditor = React.lazy(() => import('@xrengine/editor/src/pages/[sceneId]'))
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'
import FormDialog from '@xrengine/client-core/src/admin/components/UI/SubmitDialog'

const EditorProtectedRoutes = () => {
  const isSceneAllowed = userHasAccess('editor:write')

  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return (
    <>
      {isSceneAllowed ? (
        <Switch>
          <Route exact path="/editor/:sceneId" component={sceneEditor} />
          <Route exact path="/editor" component={editor} />
        </Switch>
      ) : (
        <FormDialog />
      )}
    </>
  )
}

export default EditorProtectedRoutes
