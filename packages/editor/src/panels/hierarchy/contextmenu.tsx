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
import { DropdownItem } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CreatePrefabPanel from '../../components/dialogs/CreatePrefabPanelDialog'
import { cmdOrCtrlString } from '../../functions/utils'
import { copyNodes, deleteNode, duplicateNode, groupNodes, pasteNodes } from './helpers'
import { useHierarchyNodes, useHierarchyTreeContextMenu, useNodeCollapseExpand, useRenamingNode } from './hooks'

export default function HierarchyTreeContextMenu() {
  const { t } = useTranslation()
  const { anchorEvent, setMenu, entity } = useHierarchyTreeContextMenu()
  const renamingNode = useRenamingNode()
  const { expandChildren, collapseChildren } = useNodeCollapseExpand()
  const nodes = useHierarchyNodes()
  const node = nodes.find((n) => n.entity === entity)

  const onDuplicateNode = () => {
    setMenu()
    duplicateNode(entity)
  }

  const onGroupNodes = () => {
    setMenu()
    groupNodes(entity)
  }

  const onCopyNode = () => {
    setMenu()
    copyNodes(entity)
  }

  const onPasteNode = () => {
    setMenu()
    pasteNodes(entity)
  }

  const onDeleteNode = () => {
    setMenu()
    deleteNode(entity)
  }

  return (
    <ContextMenu anchorEvent={anchorEvent} open={!!entity} onClose={() => setMenu()}>
      <div className="w-[220px]" data-testid="hierarchy-panel-scene-item-context-menu">
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-rename-button"
          onClick={() => {
            setMenu()
            renamingNode.set(entity)
          }}
          secondaryText={cmdOrCtrlString + ' + r'}
          title={t('editor:hierarchy.lbl-rename')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-duplicate-button"
          onClick={onDuplicateNode}
          secondaryText={cmdOrCtrlString + ' + d'}
          title={t('editor:hierarchy.lbl-duplicate')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-group-button"
          onClick={onGroupNodes}
          secondaryText={cmdOrCtrlString + ' + g'}
          title={t('editor:hierarchy.lbl-group')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-copy-button"
          onClick={onCopyNode}
          secondaryText={cmdOrCtrlString + ' + c'}
          title={t('editor:hierarchy.lbl-copy')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-paste-button"
          onClick={onPasteNode}
          secondaryText={cmdOrCtrlString + ' + v'}
          title={t('editor:hierarchy.lbl-paste')}
        />
        <DropdownItem
          data-testid="hierarchy-panel-scene-item-context-menu-delete-button"
          onClick={onDeleteNode}
          title={t('editor:hierarchy.lbl-delete')}
        />
        {!node?.isLeaf && (
          <>
            <DropdownItem
              onClick={() => {
                setMenu()
                expandChildren(entity)
              }}
              title={t('editor:hierarchy.lbl-expandAll')}
            />
            <DropdownItem
              onClick={() => {
                setMenu()
                collapseChildren(entity)
              }}
              title={t('editor:hierarchy.lbl-collapseAll')}
            />
          </>
        )}
        <DropdownItem
          onClick={() => {
            setMenu()
            PopoverState.showPopupover(<CreatePrefabPanel entity={entity} isExportLookDev={false} />)
          }}
          title={t('editor:hierarchy.lbl-createPrefab')}
        />
      </div>
    </ContextMenu>
  )
}
