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

import { useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { isAncestor } from '@ir-engine/spatial/src/transform/components/EntityTree'
import ElementList from '@ir-engine/ui/src/components/editor/panels/Properties/elementList'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React, { useCallback, useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { HiOutlinePlusCircle } from 'react-icons/hi2'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import useUpload from '../../components/assets/useUpload'
import { ItemTypes, SupportedFileTypes } from '../../constants/AssetTypes'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { addMediaNode } from '../../functions/addMediaNode'
import { EditorState } from '../../services/EditorServices'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { uploadOptions } from './helpers'
import HierarchyTreeNode from './hierarchynode'
import { useHierarchyNodes } from './hooks'

export function Topbar() {
  const { t } = useTranslation()
  const search = useHookstate(getMutableState(HierarchyTreeState).search)
  const isAddEntityMenuOpen = useHookstate(false)

  return (
    <div className="flex items-center gap-2 bg-theme-surface-main">
      <SearchBar search={search} />
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
  const onUpload = useUpload(uploadOptions)
  const rootEntity = useMutableState(EditorState).rootEntity.value
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)!.value

  const [, treeContainerDropTarget] = useDrop({
    accept: [ItemTypes.Node, ItemTypes.File, ...SupportedFileTypes],
    drop(item: any, monitor) {
      if (monitor.didDrop()) return

      // check if item contains files
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        //uploading files then adding to editor media
        onUpload(entries).then((assets) => {
          if (!assets) return
          for (const asset of assets) addMediaNode(asset)
        })

        return
      }

      if (item.url) {
        addMediaNode(item.url)
        return
      }

      if (item.type === ItemTypes.Component) {
        EditorControlFunctions.createObjectFromSceneElement([{ name: item!.componentJsonID }])
        return
      }

      EditorControlFunctions.reparentObject(Array.isArray(item.value) ? item.value : [item.value])
    },
    canDrop(item: any, monitor) {
      if (!monitor.isOver({ shallow: true })) return false

      // check if item is of node type
      if (item.type === ItemTypes.Node) {
        const sceneEntity = getState(GLTFAssetState)[sourceId]
        return !(item.multiple
          ? item.value.some((otherObject) => isAncestor(otherObject, sceneEntity))
          : isAncestor(item.value, sceneEntity))
      }

      return true
    }
  })

  /**an explicit callback is required to rerender changed nodes inside FixedSizeList */
  const MemoTreeNode = useCallback(
    (props: ListChildComponentProps<undefined>) => <HierarchyTreeNode {...props} />,
    [nodes]
  )

  useEffect(() => {
    if (!ref.current) return

    const handleResize = () => {
      const { height, width } = ref.current!.getBoundingClientRect()
      listDimensions.set({ height, width })
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={ref} className="h-5/6 overflow-hidden">
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
