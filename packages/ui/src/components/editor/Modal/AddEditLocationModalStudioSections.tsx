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
All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ImageLink } from '@ir-engine/ui/editor'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { Image01Sm } from '../../../icons'
import LoadingView from '../../../primitives/tailwind/LoadingView'

export default function AddEditLocationModalStudioSections() {
  const { t } = useTranslation()

  const sceneThumbnailState = useMutableState(SceneThumbnailState)

  const isGenerating = useHookstate(false)

  const generateThumbnail = async () => {
    try {
      isGenerating.set(true)
      await SceneThumbnailState.createThumbnail()
      await SceneThumbnailState.uploadThumbnail()
    } catch (e) {
      NotificationService.dispatchNotify(e, { variant: 'error' })
      console.log(e)
    } finally {
      isGenerating.set(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full flex-row justify-evenly">
        {sceneThumbnailState.thumbnailURL.value ? (
          <ImageLink
            src={sceneThumbnailState.thumbnailURL.value}
            variant="full"
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-surface-3 p-5 text-center text-gray-500">
            {!isGenerating.value ? (
              <>
                <Image01Sm className="h-12 w-12" />
                {t('editor:toolbar.publishLocation.noThumbnailPlaceholder')}
              </>
            ) : (
              <LoadingView className="h-5 w-5" />
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-row justify-end gap-2">
        <Button onClick={generateThumbnail} className="w-full md:w-auto">
          {t('editor:properties.sceneSettings.generate')}
        </Button>
      </div>
    </div>
  )
}
