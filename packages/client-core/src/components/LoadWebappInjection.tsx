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

import { useHookstate } from '@hookstate/core'
import { useFind } from '@ir-engine/common'
import { projectsPath } from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { loadWebappInjection } from '@ir-engine/projects/loadWebappInjection'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const LoadWebappInjection = (props: { children: React.ReactNode; fallback?: JSX.Element }) => {
  const { t } = useTranslation()

  const projectComponents = useHookstate(null as null | any[])
  const projects = useFind(projectsPath)

  useEffect(() => {
    if (!projects.data.length) return
    loadWebappInjection(projects.data as string[]).then((result) => {
      projectComponents.set(result)
    })
  }, [projects.data])

  if (!projectComponents.value) {
    return (
      props.fallback ?? <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingApp')} />
    )
  }

  return (
    <>
      {projectComponents.get(NO_PROXY)!.map((Component, i) => (
        <Component key={i} />
      ))}
      <Suspense fallback={props.fallback}>{props.children}</Suspense>
    </>
  )
}
