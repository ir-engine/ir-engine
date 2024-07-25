import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { timeAgo } from '@etherealengine/common/src/utils/datetime-sql'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsThreeDotsVertical } from 'react-icons/bs'
// import RenameSceneModal from '@etherealengine/ui/src/components/modals/RenameScene'
import { Popup } from '@etherealengine/ui/src/components/tailwind/Popup'

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
                // onClick={() => {
                //   PopoverState.showPopupover(
                //     <RenameSceneModal sceneName={getSceneName(scene)} refetch={refetchProjectsData} scene={scene} />
                //   )
                // }}
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
