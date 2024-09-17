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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { UUIDComponent, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CreatePrefabPanel from '../../components/dialogs/CreatePrefabPanelDialog'
import { CopyPasteFunctions } from '../../functions/CopyPasteFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { cmdOrCtrlString } from '../../functions/utils'
import { SelectionState } from '../../services/SelectionServices'
import { deleteNode } from './helpers'
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
    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity]
    EditorControlFunctions.duplicateObject(selectedEntities)
  }

  const onGroupNodes = () => {
    setMenu()
    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity]
    EditorControlFunctions.groupObjects(selectedEntities)
  }

  const onCopyNode = () => {
    setMenu()
    const selected = getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity]
    CopyPasteFunctions.copyEntities(selectedEntities)
  }

  const onPasteNode = () => {
    setMenu()
    CopyPasteFunctions.getPastedEntities()
      .then((nodeComponentJSONs) => {
        nodeComponentJSONs.forEach((componentJSONs) => {
          EditorControlFunctions.createObjectFromSceneElement(componentJSONs, undefined, entity)
        })
      })
      .catch(() => {
        NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes'), { variant: 'error' })
      })
  }

  const onDeleteNode = () => {
    setMenu()
    deleteNode(entity)
  }

  return (
    <ContextMenu anchorEvent={anchorEvent} open={!!entity} onClose={() => setMenu()}>
      <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={() => {
            setMenu()
            renamingNode.set(entity)
          }}
          endIcon={cmdOrCtrlString + ' + r'}
        >
          {t('editor:hierarchy.lbl-rename')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onDuplicateNode}
          endIcon={cmdOrCtrlString + ' + d'}
        >
          {t('editor:hierarchy.lbl-duplicate')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onGroupNodes}
          endIcon={cmdOrCtrlString + ' + g'}
        >
          {t('editor:hierarchy.lbl-group')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onCopyNode}
          endIcon={cmdOrCtrlString + ' + c'}
        >
          {t('editor:hierarchy.lbl-copy')}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={onPasteNode}
          endIcon={cmdOrCtrlString + ' + v'}
        >
          {t('editor:hierarchy.lbl-paste')}
        </Button>
        <Button fullWidth size="small" variant="transparent" className="text-left text-xs" onClick={onDeleteNode}>
          {t('editor:hierarchy.lbl-delete')}
        </Button>
        {!node?.isLeaf && (
          <>
            <Button
              fullWidth
              size="small"
              variant="transparent"
              className="text-left text-xs"
              onClick={() => {
                setMenu()
                expandChildren(entity)
              }}
            >
              {t('editor:hierarchy.lbl-expandAll')}
            </Button>
            <Button
              fullWidth
              size="small"
              variant="transparent"
              className="text-left text-xs"
              onClick={() => {
                setMenu()
                collapseChildren(entity)
              }}
            >
              {t('editor:hierarchy.lbl-collapseAll')}
            </Button>
          </>
        )}
        <Button
          fullWidth
          size="small"
          variant="transparent"
          className="text-left text-xs"
          onClick={() => PopoverState.showPopupover(<CreatePrefabPanel entity={entity} />)}
        >
          {t('editor:hierarchy.lbl-createPrefab')}
        </Button>
      </div>
    </ContextMenu>
  )
}
