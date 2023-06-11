import { useHookstate } from '@hookstate/core'
import { t } from 'i18next'
import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { PopupMenuInline } from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuInline'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { userHasAccess } from '@etherealengine/client-core/src/user/userHasAccess'
import { UserUISystem } from '@etherealengine/client-core/src/user/UserUISystem'
import { EditorPage } from '@etherealengine/editor/src/pages/EditorPage'
import { ProjectPage } from '@etherealengine/editor/src/pages/ProjectPage'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { useSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { getMutableState } from '@etherealengine/hyperflux'

const EditorProtectedRoutes = () => {
  const authState = useHookstate(getMutableState(AuthState))
  const route = useRouter()
  const user = authState.user
  const [isAuthorized, setAuthorized] = useState<boolean | null>(null)

  useSystems([UserUISystem], { after: PresentationSystemGroup })

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
      <PopupMenuInline />
      <Routes>
        <Route path=":projectName/:sceneName" element={<EditorPage />} />
        <Route path=":projectName" element={<EditorPage />} />
        <Route path="*" element={<ProjectPage />} />
      </Routes>
    </Suspense>
  )
}

export default EditorProtectedRoutes
