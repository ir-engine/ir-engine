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
import { CopyEmbedCodePopover } from '@ir-engine/client-core/src/common/components/popovers/CopyEmbedCodePopover'
import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { ThemeState } from '@ir-engine/client-core/src/common/services/ThemeService'
import { clientContextParams } from '@ir-engine/client-core/src/util/ClientContextState'
import { cloneScene, deleteScene } from '@ir-engine/client-core/src/world/SceneAPI'
import IRLogoModalDark from '@ir-engine/client/src/assets/iR-logo-Modal-dark.png'
import IRLogoModalLight from '@ir-engine/client/src/assets/iR-logo-Modal-light.png'
import config from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import { StaticResourceType } from '@ir-engine/common/src/schema.type.module'
import { timeAgo } from '@ir-engine/common/src/utils/datetime-sql'
import RenameSceneModal from '@ir-engine/editor/src/panels/scenes/RenameSceneModal'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import MoreOptionsMenu from '@ir-engine/ui/src/components/tailwind/MoreOptionsMenu'
import { CodeSnippet01Sm, Copy02Sm, Edit01Sm, Trash04Sm } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { default as React } from 'react'
import { useTranslation } from 'react-i18next'
import { IoDuplicateOutline } from 'react-icons/io5'
import { twMerge } from 'tailwind-merge'
import { UIAddonsState } from '../../services/UIAddonsState'
import SceneCard from './SceneCard'

const logger = multiLogger.child({ component: `editor:SceneItem`, modifier: clientContextParams })
export interface SceneItemMoreOtionData {
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  onClick: (scene: StaticResourceType) => void
}

type SceneItemProps = {
  scene: StaticResourceType
  handleOpenScene: () => void
  refetchProjectsData: () => void
  onCloneToProject?: () => void
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
  onCloneToProject,
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
    ModalState.closeModal()
  }

  const defaultThumbnail = theme?.value === 'dark' ? IRLogoModalLight : IRLogoModalDark
  const sceneItemMoreOptions = useMutableState(UIAddonsState).editor.sceneItemMoreOptions.get(NO_PROXY)

  const actionProps = [
    {
      label: t('editor:hierarchy.lbl-rename'),
      disabled: false,
      icon: <Edit01Sm fontSize={16} />,
      onClick: () => {
        ModalState.openModal(
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
      label: t('editor:hierarchy.lbl-copyEmbedCode'),
      disabled: false,
      icon: <CodeSnippet01Sm fontSize={16} />,
      onClick: () => {
        const sceneName = scene.key.split('/').pop()!.replace('.gltf', '')
        ModalState.openModal(<CopyEmbedCodePopover url={`${config.client.clientUrl}/location/${sceneName}`} />)
      }
    },
    {
      label: t('editor:hierarchy.lbl-cloneScene'),
      disabled: false,
      icon: <IoDuplicateOutline fontSize={16} />,
      onClick: async () => {
        logger.analytics({ event_name: 'clone_scene' })
        await cloneScene(scene, scene.key, scene.project!, scene.project!)
        refetchProjectsData()
      }
    },
    {
      label: t('editor:hierarchy.lbl-delete'),
      disabled: disableDeleteScene,
      icon: <Trash04Sm fontSize={16} />,
      onClick: () => {
        ModalState.openModal(
          <ConfirmDialog
            title={t('editor:hierarchy.lbl-deleteScene')}
            text={t('editor:hierarchy.lbl-deleteSceneDescription', { sceneName })}
            onSubmit={async () => deleteSelectedScene(scene)}
          />
        )
      }
    },
    ...Object.values(sceneItemMoreOptions).map((value, index) => {
      return {
        label: value.label,
        disabled: value.disabled,
        icon: value.icon,
        onClick: () => {
          value.onClick(scene)
        }
      }
    })
  ]

  if (onCloneToProject) {
    const cloneSceneIndex = actionProps.findIndex((item) => item.label === t('editor:hierarchy.lbl-cloneScene'))
    actionProps.splice(cloneSceneIndex + 1, 0, {
      label: t('editor:hierarchy.lbl-cloneSceneToProject'),
      disabled: false,
      icon: <Copy02Sm fontSize={16} />,
      onClick: () => {
        logger.analytics({ event_name: 'clone_scene_to_project' })
        onCloneToProject()
      }
    })
  }

  return (
    <SceneCard data-testid="scene-container" className="cursor-pointer items-start justify-start gap-3 bg-white p-3">
      <div className="flex max-h-40 shrink grow basis-0 items-center justify-center self-stretch rounded bg-surface-4">
        <img
          className={twMerge(
            'h-full w-full object-cover',
            scene.thumbnailURL ? 'rounded' : 'h-auto max-h-32 w-full max-w-32'
          )}
          src={scene.thumbnailURL || defaultThumbnail}
          alt={defaultThumbnail}
          data-testid="scene-thumbnail"
          onClick={handleOpenScene}
        />
      </div>
      <div className="inline-flex items-start justify-between self-stretch">
        <div className="inline-flex w-full flex-col items-start justify-start gap-1.5">
          <div className="space-between flex w-full flex-row">
            <Tooltip content={sceneName} position="top">
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

        <MoreOptionsMenu position="right top" actionProps={actionProps} />
      </div>
    </SceneCard>
  )
}
