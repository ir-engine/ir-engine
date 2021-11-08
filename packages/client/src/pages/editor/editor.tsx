import React, { Fragment, Suspense, useEffect, useRef } from 'react'
import ProjectEditor from '@xrengine/editor/src/pages/editor'
import { userHasAccess } from '@xrengine/client-core/src/user/userHasAccess'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import FormDialog from '@xrengine/client-core/src/admin/components/UI/SubmitDialog'
import CircularProgress from '@mui/material/CircularProgress'

const canvasStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute'
}

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
          <canvas style={canvasStyle} tabIndex={-1} id="viewport-canvas" />
          <div style={canvasStyle}>{isSceneAllowed ? <ProjectEditor /> : <FormDialog />}</div>
        </Suspense>
      </Fragment>
    </>
  )
}

export default EditorProtectedRoutes
