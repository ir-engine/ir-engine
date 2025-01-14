/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React, { Suspense, useEffect } from 'react'

import '../../engine'

import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'
import Debug from '@ir-engine/client-core/src/components/Debug'
import { PopupMenuInline } from '@ir-engine/client-core/src/user/components/UserMenu/PopupMenuInline'
import { useFind } from '@ir-engine/common'
import { ScopeType, scopePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { EditorPage, useStudioEditor } from '@ir-engine/editor/src/pages/EditorPage'
import { useHookstate } from '@ir-engine/hyperflux'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { Route, Routes, useLocation } from 'react-router-dom'

export const EditorRouter = () => {
  const ready = useStudioEditor()

  if (!ready) return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingStudio')} />

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingStudio')} />}
    >
      <PopupMenuInline />
      <Routes>
        <Route path="*" element={<EditorPage />} />
      </Routes>
    </Suspense>
  )
}

const EditorProtectedRoutes = () => {
  const location = useLocation()
  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.userID,
      type: 'editor:write' as ScopeType
    }
  })

  const isAuthorized = useHookstate<boolean | null>(null)

  useEffect(() => {
    if (scopeQuery.status !== 'success') return
    if (!scopeQuery.data.length) {
      isAuthorized.set(false)
      RouterState.navigate('/', { redirectUrl: location.pathname })
    } else isAuthorized.set(true)
  }, [scopeQuery.data, scopeQuery.status])

  if (!isAuthorized.value) return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.auth')} />

  return (
    <>
      <EditorRouter />
      <Debug />
    </>
  )
}

export default EditorProtectedRoutes
