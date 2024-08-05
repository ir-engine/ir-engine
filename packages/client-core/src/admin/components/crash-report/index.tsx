/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import config from '@etherealengine/common/src/config'
import { metabasePath } from '@etherealengine/common/src/schema.type.module'
import { useHookstate } from '@etherealengine/hyperflux'
import { useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import { isEmpty } from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function CrashReport() {
  const { t } = useTranslation()
  const analyticMutation = useMutation(metabasePath)
  const iframeUrl = useHookstate<string>('')

  useEffect(() => {
    analyticMutation.create().then(async (token) => {
      iframeUrl.set(
        `${config.client.metabase.siteUrl}/embed/dashboard/${token}#theme=night&bordered=false&titled=false`
      )
    })
  }, [])

  return (
    <>
      <div>
        <Text fontSize="xl" className="mb-6">
          {t('admin:components.crashReport.title')}
        </Text>
      </div>
      <div className="flex h-full w-full flex-col">
        {isEmpty(iframeUrl.value) && (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <LoadingView className="block h-12 w-12" title={t('admin:components.crashReport.loading')} />
          </div>
        )}
        {!isEmpty(iframeUrl.value) && (
          <div className="flex-1 overflow-auto">
            <iframe src={iframeUrl.value} width="100%" height="100%" />
          </div>
        )}
      </div>
    </>
  )
}
