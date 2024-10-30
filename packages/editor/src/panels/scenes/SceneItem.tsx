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
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { deleteScene } from '@ir-engine/client-core/src/world/SceneAPI'
import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import { timeAgo } from '@ir-engine/common/src/utils/datetime-sql'
import RenameSceneModal from '@ir-engine/editor/src/panels/scenes/RenameSceneModal'
import { useHookstate } from '@ir-engine/hyperflux'
import { DropdownItem } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import { default as React } from 'react'
import { useTranslation } from 'react-i18next'
import { BsThreeDotsVertical } from 'react-icons/bs'

type SceneItemProps = {
  scene: StaticResourceType
  handleOpenScene: () => void
  refetchProjectsData: () => void
  onRenameScene?: (newName: string) => void
  onDeleteScene?: (scene: StaticResourceType) => void
}

export default function SceneItem({
  scene,
  handleOpenScene,
  refetchProjectsData,
  onRenameScene,
  onDeleteScene
}: SceneItemProps) {
  const { t } = useTranslation()

  const sceneName = scene.key.split('/').pop()!.replace('.gltf', '')
  const isOptionsPopupOpen = useHookstate(false)

  const deleteSelectedScene = async (scene: StaticResourceType) => {
    if (scene) {
      await deleteScene(scene.key)

      if (onDeleteScene) {
        onDeleteScene(scene)
      } else {
        refetchProjectsData()
      }
    }
    PopoverState.hidePopupover()
  }

  return (
    <div
      data-testid="scene-container"
      className="col-span-2 inline-flex h-64 w-64 min-w-64 max-w-64 cursor-pointer flex-col items-start justify-start gap-3 rounded-lg bg-[#191B1F] p-3 lg:col-span-1"
    >
      <img
        className="shrink grow basis-0 self-stretch rounded"
        src={scene.thumbnailURL}
        data-testid="scene-thumbnail"
        onClick={handleOpenScene}
      />
      <div className="inline-flex items-start justify-between self-stretch">
        <div className="inline-flex w-full flex-col items-start justify-start">
          <div className="space-between flex w-full flex-row">
            <Text component="h3" fontWeight="light" className="leading-6 text-neutral-100">
              <Tooltip content={sceneName}>
                <div className="w-52 truncate" data-testid="scene-name">
                  {sceneName}
                </div>
              </Tooltip>
            </Text>
          </div>
          <Text
            component="h3"
            fontSize="xs"
            fontWeight="light"
            className="h-3.5 w-40 leading-5 text-neutral-100"
            data-testid="scene-updated-at"
          >
            {t('editor:hierarchy.lbl-edited')} {t('common:timeAgo', { time: timeAgo(new Date(scene.updatedAt)) })}
          </Text>
        </div>
        <div className="relative h-6 w-6">
          <Popup
            open={isOptionsPopupOpen.value}
            trigger={
              <Button
                variant="transparent"
                size="small"
                className="px-2 py-1.5"
                startIcon={<BsThreeDotsVertical className="text-neutral-100" />}
                data-testid="scene-options-button"
                onClick={() => isOptionsPopupOpen.set(true)}
              />
            }
          >
            <div className="w-[180px]" tabIndex={0}>
              <DropdownItem
                className="rounded-t-lg"
                title={t('editor:hierarchy.lbl-rename')}
                onClick={() =>
                  PopoverState.showPopupover(
                    <RenameSceneModal
                      sceneName={sceneName}
                      scene={scene}
                      onRenameScene={onRenameScene}
                      refetchProjectsData={refetchProjectsData}
                    />
                  )
                }
                data-testid="scene-rename-button"
              />
              <DropdownItem
                className="rounded-b-lg"
                title={t('editor:hierarchy.lbl-delete')}
                onClick={() =>
                  PopoverState.showPopupover(
                    <ConfirmDialog
                      title={t('editor:hierarchy.lbl-deleteScene')}
                      text={t('editor:hierarchy.lbl-deleteSceneDescription', { sceneName })}
                      onSubmit={async () => deleteSelectedScene(scene)}
                    />
                  )
                }
                data-testid="scene-delete-button"
              />
            </div>
          </Popup>
        </div>
      </div>
    </div>
  )
}
