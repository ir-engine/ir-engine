import React, { Suspense, useEffect } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import FormDialog from '@xrengine/client-core/src/admin/components/UI/SubmitDialog'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import ProjectEditor from '@xrengine/editor/src/pages/editor'

const EditorProtectedRoutes = () => {
  const isSceneAllowed = userHasAccess('editor:write')

  useEffect(() => {
    AuthService.doLoginAuto(false)
  }, [])

  return (
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
  )
}

export default EditorProtectedRoutes
