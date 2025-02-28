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
import { ThemeState } from '@ir-engine/client-core/src/common/services/ThemeService'
import { deleteScene } from '@ir-engine/client-core/src/world/SceneAPI'
import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import { timeAgo } from '@ir-engine/common/src/utils/datetime-sql'
import RenameSceneModal from '@ir-engine/editor/src/panels/scenes/RenameSceneModal'
import { useMutableState } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import MoreOptionsMenu from '@ir-engine/ui/src/components/tailwind/MoreOptionsMenu'
import { Edit01Sm, Trash04Sm } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { default as React } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

type SceneItemProps = {
  scene: StaticResourceType
  handleOpenScene: () => void
  refetchProjectsData: () => void
  onRenameScene?: (newName: string) => void
  onDeleteScene?: (scene: StaticResourceType) => void
  disableDeleteScene?: boolean
}

export default function SceneItem({
  scene,
  handleOpenScene,
  refetchProjectsData,
  onRenameScene,
  onDeleteScene,
  disableDeleteScene
}: SceneItemProps) {
  const { t } = useTranslation()

  const sceneName = scene.key.split('/').pop()!.replace('.gltf', '')
  const theme = useMutableState(ThemeState).theme

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

  const defaultThumbnail = theme?.value === 'dark' ? '/iR-logo-Modal-light.png' : '/iR-logo-Modal-dark.png'

  return (
    <div
      data-testid="scene-container"
      className="col-span-2 inline-flex h-64 w-64 min-w-64 max-w-64 cursor-pointer flex-col items-start justify-start gap-3 rounded-lg border border-ui-outline bg-ui-background p-3 lg:col-span-1"
    >
      <div className="flex max-h-40 shrink grow basis-0 items-center justify-center self-stretch rounded bg-surface-4">
        <img
          className={twMerge(scene.thumbnailURL ? 'rounded' : 'h-auto max-h-32 w-full max-w-32 ')}
          src={scene.thumbnailURL || defaultThumbnail}
          alt={defaultThumbnail}
          data-testid="scene-thumbnail"
          onClick={handleOpenScene}
        />
      </div>
      <div className="inline-flex items-start justify-between self-stretch">
        <div className="inline-flex w-full flex-col items-start justify-start">
          <div className="space-between flex w-full flex-row">
            <Tooltip content={sceneName}>
              <Text
                component="h3"
                fontWeight="semibold"
                className="w-52 truncate leading-6 text-text-primary"
                data-testid="scene-name"
                fontSize="xl"
              >
                {sceneName}
              </Text>
            </Tooltip>
          </div>
          <Text
            component="h3"
            fontSize="sm"
            className="h-3.5 w-40 leading-5 text-text-primary"
            data-testid="scene-updated-at"
          >
            {t('editor:hierarchy.lbl-edited')} {t('common:timeAgo', { time: timeAgo(new Date(scene.updatedAt)) })}
          </Text>
        </div>

        <MoreOptionsMenu
          actionProps={[
            {
              label: t('editor:hierarchy.lbl-rename'),
              disabled: false,
              icon: <Edit01Sm />,
              onClick: () => {
                PopoverState.showPopupover(
                  <RenameSceneModal
                    sceneName={sceneName}
                    scene={scene}
                    onRenameScene={onRenameScene}
                    refetchProjectsData={refetchProjectsData}
                  />
                )
              }
            },
            {
              label: t('editor:hierarchy.lbl-delete'),
              disabled: disableDeleteScene,
              icon: <Trash04Sm />,
              onClick: () => {
                PopoverState.showPopupover(
                  <ConfirmDialog
                    title={t('editor:hierarchy.lbl-deleteScene')}
                    text={t('editor:hierarchy.lbl-deleteSceneDescription', { sceneName })}
                    onSubmit={async () => deleteSelectedScene(scene)}
                  />
                )
              }
            }
          ]}
        />
      </div>
    </div>
  )
}
