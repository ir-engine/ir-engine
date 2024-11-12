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

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React, { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePlusCircle } from 'react-icons/hi2'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import ElementList from '../properties/elementlist'
import HierarchyTreeNode from './hierarchynode'
import { useHierarchyNodes, useHierarchyTreeDrop, useHierarchyTreeHotkeys } from './hooks'

export function Topbar() {
  const { t } = useTranslation()
  const search = useHookstate(getMutableState(HierarchyTreeState).search)
  const isAddEntityMenuOpen = useHookstate(false)

  return (
    <div className="flex h-8 items-center justify-between gap-2 bg-[#212226]" data-testid="hierarchy-panel-top-bar">
      <SearchBar inputProps={{ fullWidth: true }} search={search} debounceTime={100} />
      <Popup
        keepInside
        open={isAddEntityMenuOpen.value}
        onClose={() => isAddEntityMenuOpen.set(false)}
        trigger={
          <Button
            startIcon={<HiOutlinePlusCircle />}
            variant="transparent"
            rounded="none"
            className="ml-auto w-32 text-nowrap bg-theme-highlight px-2 py-3 text-white"
            size="small"
            textContainerClassName="mx-0"
            data-testid="hierarchy-panel-add-entity-button"
            onClick={() => isAddEntityMenuOpen.set(true)}
          >
            {t('editor:hierarchy.lbl-addEntity')}
          </Button>
        }
      >
        <div className="h-full w-96 overflow-y-auto">
          <ElementList type="prefabs" onSelect={() => isAddEntityMenuOpen.set(false)} />
        </div>
      </Popup>
    </div>
  )
}

export function Contents() {
  const listDimensions = useHookstate({
    height: 0,
    width: 0
  })
  const nodes = useHierarchyNodes()
  const ref = useRef<HTMLDivElement>(null)

  const { canDrop, isOver, dropTarget: treeContainerDropTarget } = useHierarchyTreeDrop()

  /**an explicit callback is required to rerender changed nodes inside FixedSizeList */
  const MemoTreeNode = useCallback(
    (props: ListChildComponentProps<undefined>) => <HierarchyTreeNode {...props} />,
    [nodes]
  )

  useEffect(() => {
    if (!ref.current) return
    const handleResize = () => {
      if (!ref.current) return
      const { height, width } = ref.current.getBoundingClientRect()
      listDimensions.set({ height, width })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  useHierarchyTreeHotkeys()

  return (
    <div
      ref={ref}
      className={twMerge('h-5/6 overflow-hidden', isOver && canDrop && 'border border-dotted')}
      data-testid="hierarchy-panel-scene-item-list"
    >
      <FixedSizeList
        height={listDimensions.height.value}
        width={listDimensions.width.value}
        itemSize={40}
        itemData={{ nodes }}
        itemCount={nodes.length}
        itemKey={(index: number) => index}
        outerRef={treeContainerDropTarget}
        innerElementType="ul"
      >
        {MemoTreeNode}
      </FixedSizeList>
    </div>
  )
}
