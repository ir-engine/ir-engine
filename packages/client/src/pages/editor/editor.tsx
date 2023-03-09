import { t } from 'i18next'
import React, { Suspense } from 'react'

import FormDialog from '@etherealengine/client-core/src/admin/common/SubmitDialog'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { userHasAccessHook } from '@etherealengine/client-core/src/user/userHasAccess'
import ProjectEditor from '@etherealengine/editor/src/pages/editor'

const EditorProtectedRoutes = () => {
  const isSceneAllowed = userHasAccessHook('editor:write')

  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.editor')} />}>
      {isSceneAllowed ? <ProjectEditor /> : <FormDialog />}
    </Suspense>
  )
}

export default EditorProtectedRoutes
