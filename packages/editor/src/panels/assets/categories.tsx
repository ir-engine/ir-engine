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

import capitalizeFirstLetter from '@ir-engine/common/src/utils/capitalizeFirstLetter'
import { getDecodedFileName } from '@ir-engine/common/src/utils/cleanFileName'
import { NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import EditorDropdownItem from '@ir-engine/ui/src/components/editor/DropdownItem'
import { CubeOutlineLg, File04Lg, Folder, Pin02Lg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { ResourceType } from '.'
import { EditorState } from '../../services/EditorServices'
import { FilesState } from '../../services/FilesState'
import { useCurrentFiles } from '../files/helpers'
import { assetCategories, useAssetsCategory, useAssetsQuery } from './hooks'

export type AssetCategoryNode = {
  name: string
  path: string
  depth: number
  children: AssetCategoryNode[]
}

function NodeHierarchyItem({ node, onClick }: { node: AssetCategoryNode; onClick: (item) => void }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = () => {
    onClick(node)
    setIsOpen(!isOpen)
  }

  return (
    <>
      <EditorDropdownItem
        label={getDecodedFileName(node.name)}
        ItemIcon={({ className }: { className: string }) => <Folder className={className} />}
        collapsed={!isOpen}
        onClick={handleClick}
        style={{ paddingLeft: `${32 * node.depth}px` }}
        hasChildren={node.children.length > 0}
      />

      {isOpen &&
        node.children &&
        node.children.map((child) => <NodeHierarchyItem key={child.path} node={child} onClick={onClick} />)}
    </>
  )
}

function FolderCategory({ item }: { item: AssetCategoryNode }) {
  const { changeDirectoryByPath } = useCurrentFiles()

  const handleClick = (item) => {
    changeDirectoryByPath(item.path ?? '')
  }

  return <NodeHierarchyItem node={item} onClick={handleClick} />
}

function AssetCategory({ item }: { item: AssetCategoryNode }) {
  const { currentCategoryPath, activeTab } = useAssetsCategory()
  const { refetchResources, staticResourcesPagination } = useAssetsQuery()

  const handleClickCategory = (item) => {
    if (item.name === 'Project Assets') {
      activeTab.set(ResourceType.MY_ASSETS)
    } else {
      currentCategoryPath.set(item)
      staticResourcesPagination.skip.set(0)
      refetchResources()
      activeTab.set(ResourceType.ASSETS)
    }
  }

  return <NodeHierarchyItem node={item} onClick={handleClickCategory} />
}

const SideBarIcons = {
  favorites: Pin02Lg,
  assets: CubeOutlineLg,
  files: File04Lg
}

function SidebarSection({ Icon, label, items, onClick, isActive }) {
  const [isHover, setIsHover] = React.useState(false)
  const { activeTab } = useAssetsCategory()

  const toggleDropdown = () => {
    if (isActive) {
      onClick(undefined)
    } else {
      onClick(label)
      activeTab.set(label)
    }
  }

  const renderListByType = {
    assets: items.map((item: AssetCategoryNode, idx) => <AssetCategory item={item} key={item.name + idx} />),
    files: items.map((item: AssetCategoryNode, idx) => <FolderCategory item={item} key={item.name + idx} />)
  }

  return (
    <div
      className={twMerge(
        'transition-all duration-300 ease-in-out',
        isActive && items.length > 0 ? 'h-auto flex-grow' : ''
      )}
    >
      <div
        className={twMerge(
          'overflow-hidden rounded bg-surface-1 p-2 text-text-secondary',
          'border-2',
          isActive ? 'border-[#375DAF]' : 'border-transparent'
        )}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <button className="flex h-full w-full items-center justify-between" onClick={toggleDropdown}>
          <div className="flex items-center gap-2">
            <Icon />
            <span>{capitalizeFirstLetter(label)}</span>
          </div>
        </button>
      </div>

      {isActive && items.length > 0 && (
        <div className="h-full overflow-y-auto rounded bg-surface-1 p-2 text-text-secondary">
          {renderListByType[label] || <></>}
        </div>
      )}
    </div>
  )
}

export default function CategoriesList({ selected, onClick }) {
  const { sidebarWidth } = useAssetsCategory()
  const { files, categories: folderCategories } = useCurrentFiles()

  const [sidebarSections, setSidebarSections] = React.useState<{
    favorites: AssetCategoryNode[]
    assets: AssetCategoryNode[]
    files: AssetCategoryNode[]
  }>({
    favorites: [],
    assets: [],
    files: []
  })

  React.useEffect(() => {
    if (assetCategories) {
      setSidebarSections({
        ...sidebarSections,
        assets: [
          { name: 'Project Assets', path: '', depth: 0, children: [] },
          { name: 'iR Studio Assets', path: '', depth: 0, children: [...assetCategories] }
        ] as AssetCategoryNode[]
      })
    }

    if (files.length) {
      setSidebarSections({
        ...sidebarSections,
        files: [...folderCategories.get(NO_PROXY)] as AssetCategoryNode[]
      })
    }
  }, [assetCategories, folderCategories.value])

  const filesState = useMutableState(FilesState)

  const projectName = useMutableState(EditorState).projectName.value
  React.useEffect(() => {
    if (projectName) {
      filesState.merge({ selectedDirectory: `/projects/${projectName}/public/`, projectName: projectName })
    }
  }, [projectName])

  return (
    <div
      className="mb-8 h-full space-y-1 overflow-x-hidden overflow-y-scroll bg-ui-background pb-8 pl-1 pr-2 pt-2"
      style={{ width: sidebarWidth.value }}
    >
      {Object.entries(sidebarSections).map(([key, value]) => {
        return (
          <SidebarSection
            isActive={key === selected}
            key={key}
            label={key}
            items={value}
            Icon={SideBarIcons[key]}
            onClick={onClick}
          />
        )
      })}
    </div>
  )
}

export function VerticalDivider({
  leftChildren,
  rightChildren
}: {
  leftChildren: React.ReactNode
  rightChildren: React.ReactNode
}) {
  const { sidebarWidth } = useAssetsCategory()
  const isDragging = useHookstate(false)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    isDragging.set(true)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging.value) {
      const newWidth = Math.max(200, event.pageX)
      sidebarWidth.set(newWidth)
    }
  }

  const handleMouseUp = () => {
    isDragging.set(false)
  }

  return (
    <div className="flex h-full w-full overflow-hidden" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <div style={{ width: `${sidebarWidth.value}px` }} className="h-full">
        {leftChildren}
      </div>

      {/* Divider */}
      <div className="flex w-2 cursor-ew-resize items-center bg-surface-1" data-testid="assets-panel-vertical-divider">
        <div
          onMouseDown={handleMouseDown}
          className={twMerge('h-full w-full cursor-ew-resize text-white', isDragging.value && 'cursor-grabbing')}
        />
      </div>

      <div className="h-full flex-1">{rightChildren}</div>
    </div>
  )
}
