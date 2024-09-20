import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Slider from '@ir-engine/ui/src/primitives/tailwind/Slider'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiRefreshCcw } from 'react-icons/fi'
import { HiMagnifyingGlass, HiOutlineFolder, HiOutlinePlusCircle } from 'react-icons/hi2'
import { IoArrowBack, IoSettingsSharp } from 'react-icons/io5'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesViewModeSettings } from '../../services/FilesState'
import { useAssetsCategory, useAssetsQuery } from './hooks'

const ViewModeSettings = () => {
  const { t } = useTranslation()
  const viewModeSettings = useMutableState(FilesViewModeSettings)

  return (
    <Popup
      contentStyle={{ background: '#15171b', border: 'solid', borderColor: '#5d646c' }}
      position={'bottom left'}
      trigger={
        <Tooltip content={t('editor:layout.filebrowser.view-mode.settings.name')}>
          <Button startIcon={<IoSettingsSharp />} className="h-7 w-7 rounded-lg bg-[#2F3137] p-0" />
        </Tooltip>
      }
    >
      <div className="flex flex-col">
        <InputGroup label={t('editor:layout.filebrowser.view-mode.settings.fontSize')}>
          <Slider
            min={10}
            max={100}
            step={0.5}
            value={viewModeSettings.list.fontSize.value}
            onChange={viewModeSettings.list.fontSize.set}
            onRelease={viewModeSettings.list.fontSize.set}
          />
        </InputGroup>
      </div>
    </Popup>
  )
}

const uploadFiles = () => {
  const projectName = getState(EditorState).projectName
  return inputFileWithAddToScene({
    projectName: projectName as string,
    directoryPath: `projects/${projectName}/assets/`
  }).catch((err) => {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  })
}

export function AssetsBreadcrumbs() {
  const { currentCategoryPath } = useAssetsCategory()
  const { refetchResources } = useAssetsQuery()
  const parentCategories = currentCategoryPath.length > 1 ? currentCategoryPath.slice(0, -1) : []
  const currentCategory = currentCategoryPath.length > 0 ? currentCategoryPath.at(-1) : null

  const handleSelectParentCategory = (index: number) => {
    currentCategoryPath.set((prevPath) => prevPath.slice(0, index + 1))
    refetchResources()
  }

  return (
    <div className="flex h-7 w-96 items-center gap-2 rounded-lg border border-theme-input bg-[#141619] px-2 ">
      <HiOutlineFolder
        onClick={() => handleSelectParentCategory(0)}
        className="cursor-pointer text-xs text-[#A3A3A3]"
      />
      {parentCategories.map((category, idx) => (
        <span
          key={category.name.value}
          className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3]"
          onClick={() => handleSelectParentCategory(idx)}
        >
          <span className="hover:underline">{category.name.value}</span>
          <span>{' > '}</span>
        </span>
      ))}
      {currentCategory && (
        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3]">
          {currentCategory.name.value}
        </span>
      )}
    </div>
  )
}

export default function Topbar() {
  const { t } = useTranslation()
  const { search } = useAssetsQuery()
  const { currentCategoryPath, expandedCategories } = useAssetsCategory()
  const { refetchResources } = useAssetsQuery()

  const handleBack = () => {
    currentCategoryPath.set((path) => path.slice(0, -1))
    refetchResources()
  }

  const handleRefresh = () => {
    expandedCategories.set({})
    refetchResources()
  }

  return (
    <div className="mb-1 flex h-9 items-center gap-2 bg-theme-surface-main">
      <div className="ml-2" />
      <div className="flex h-7 w-7 items-center rounded-lg bg-[#2F3137]">
        <Tooltip content={t('editor:layout.filebrowser.back')} className="left-1">
          <Button variant="transparent" startIcon={<IoArrowBack />} className="p-0" onClick={handleBack} />
        </Tooltip>
      </div>
      <div className="flex h-7 w-7 items-center rounded-lg bg-[#2F3137]">
        <Tooltip content={t('editor:layout.filebrowser.refresh')}>
          <Button variant="transparent" startIcon={<FiRefreshCcw />} className="p-0" onClick={handleRefresh} />
        </Tooltip>
      </div>
      <ViewModeSettings />
      <div className="align-center flex h-7 w-full justify-center gap-2 sm:px-2 md:px-4 lg:px-6 xl:px-10">
        <AssetsBreadcrumbs />
        <SearchBar
          inputProps={{
            placeholder: t('editor:layout.scene-assets.search-placeholder'),
            labelClassname: 'text-sm text-red-500',
            containerClassName: 'flex h-full w-auto',
            className:
              'h-7 rounded-lg border border-theme-input bg-[#141619] px-2 py-0 text-xs text-[#A3A3A3] placeholder:text-[#A3A3A3] focus-visible:ring-0',
            startComponent: <HiMagnifyingGlass className="h-3.5 w-3.5 text-[#A3A3A3]" />
          }}
          search={search}
        />
      </div>
      <Button
        startIcon={<HiOutlinePlusCircle className="text-lg" />}
        rounded="none"
        className="h-full whitespace-nowrap bg-theme-highlight px-2"
        size="small"
        onClick={() => uploadFiles().then(handleRefresh)}
      >
        {t('editor:layout.filebrowser.uploadAssets')}
      </Button>
    </div>
  )
}
