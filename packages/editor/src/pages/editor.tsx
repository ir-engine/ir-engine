import { t } from 'i18next'
import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@etherealengine/client-core/src/user/userHasAccess'

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

  if (!isAuthorized) return <LoadingCircle message={t('common:loader.auth')} />

  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingEditor')} />}>
      <Routes>
        <Route path=":projectName/:sceneName" element={<EditorPage />} />
        <Route path=":projectName" element={<EditorPage />} />
        <Route path="*" element={<ProjectPage />} />
        {/* Not in use */}
        {/* <Route path="/studio-login" element={<SignInPage />} /> */}
      </Routes>
    </Suspense>
  )
}

export default EditorProtectedRoutes
