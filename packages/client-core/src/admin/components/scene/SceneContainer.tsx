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

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { timeAgo } from '@etherealengine/common/src/utils/datetime-sql'
import RenameSceneModal from '@etherealengine/ui/src/components/editor/panels/Scenes/modals/RenameScene'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import { Popup } from '@etherealengine/ui/src/components/tailwind/Popup'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsThreeDotsVertical } from 'react-icons/bs'

export default function SceneContainer({
  scene,
  handleOpenScene,
  refetchProjectsData,
  getSceneName,
  deleteSelectedScene
}) {
  const { t } = useTranslation()

  return (
    <div
      key={scene.id}
      className="col-span-2 inline-flex h-64 w-64 cursor-pointer flex-col gap-2 rounded-lg bg-[#191B1F] p-3 lg:col-span-1"
    >
      <img
        src={scene.thumbnailURL ?? 'static/ir.svg'}
        alt={scene.key}
        onError={(e) => {
          e.currentTarget.src = 'static/ir.svg'
        }}
        crossOrigin="anonymous"
        className="object-fit block h-44 w-full grow cursor-pointer self-center rounded"
        onClick={handleOpenScene}
      />
      <div className="inline-flex justify-between self-stretch px-1">
        <div className="inline-flex w-full flex-col items-start justify-start">
          <Text className="truncate text-sm text-[#A3A3A3]">{getSceneName(scene)}</Text>
          <Text fontSize="xs" fontWeight="light" className="h-3.5 w-40 leading-5 text-neutral-100">
            {t('multitenancy:scene.edited')} {t('common:timeAgo', { time: timeAgo(new Date(scene.updatedAt)) })}
          </Text>
        </div>
        <div className="relative">
          <Popup
            keepInside
            trigger={
              <Button
                variant="transparent"
                startIcon={<BsThreeDotsVertical />}
                iconContainerClassName="mx-0"
                className="px-0"
              />
            }
          >
            <div className="flex flex-col">
              <Button
                variant="outline"
                size="small"
                fullWidth
                onClick={() => {
                  PopoverState.showPopupover(
                    <RenameSceneModal sceneName={getSceneName(scene)} refetch={refetchProjectsData} scene={scene} />
                  )
                }}
              >
                {t('editor:hierarchy.lbl-rename')}
              </Button>
              <Button
                variant="outline"
                size="small"
                fullWidth
                onClick={() => {
                  {
                    PopoverState.showPopupover(
                      <ConfirmDialog
                        text={t('editor:hierarchy.lbl-deleteScene', { sceneName: getSceneName(scene) })}
                        onSubmit={async () => deleteSelectedScene(scene)}
                      />
                    )
                  }
                }}
              >
                {t('editor:hierarchy.lbl-delete')}
              </Button>
            </div>
          </Popup>
        </div>
      </div>
    </div>
  )
}
