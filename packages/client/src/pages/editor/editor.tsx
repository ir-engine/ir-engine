import CircularProgress from '@mui/material/CircularProgress'
import FormDialog from '@xrengine/client-core/src/admin/components/UI/SubmitDialog'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import ProjectEditor from '@xrengine/editor/src/pages/editor'
import React, { Fragment, Suspense, useEffect } from 'react'

const EditorProtectedRoutes = () => {
  const isSceneAllowed = userHasAccess('editor:write')

  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return (
    <>
      <Fragment>
        <Suspense
          fallback={
            <div
              style={{
                height: '100vh',
                width: '100%',
                textAlign: 'center',
                paddingTop: 'calc(50vh - 7px)'
              }}
            >
              <CircularProgress />
            </div>
          }
        >
          {isSceneAllowed ? <ProjectEditor /> : <FormDialog />}
        </Suspense>
      </Fragment>
    </>
  )
}

export default EditorProtectedRoutes
