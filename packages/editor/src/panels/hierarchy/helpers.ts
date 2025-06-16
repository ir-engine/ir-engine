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
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { Entity, EntityTreeComponent, getOptionalComponent, Layers, UUIDComponent } from '@ir-engine/ecs'
import { AllFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'

import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'
import { getState } from '@ir-engine/hyperflux'
import { t } from 'i18next'
import { CopyPasteFunctions, EntityCopyDataType } from '../../functions/CopyPasteFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { isEntityGlb } from '../../functions/utils'
import { HierarchyTreeState } from '../../services/HierarchyNodeState'
import { SelectionState } from '../../services/SelectionServices'

export type HierarchyTreeNodeType = {
  depth: number
  entity: Entity
  childIndex: number
  lastChild: boolean
  isLeaf?: boolean
  isCollapsed?: boolean
  isRendered?: boolean
  parentEntity?: Entity
}

/* COMMON */

export const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/** UTILITIES **/

/* NODE FUNCTIONALITIES */

export const getSelectedEntities = (entity?: Entity) => {
  const selected = entity ? getState(SelectionState).selectedEntities.includes(UUIDComponent.get(entity)) : true
  const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity!]
  return selectedEntities
}

export function getNodeElId(node: HierarchyTreeNodeType) {
  return 'hierarchy-node-' + node.entity
}

export const deleteNode = (entity: Entity) => {
  const entities = getSelectedEntities(entity)
  EditorControlFunctions.removeObject(entities)
  AuthoringState.snapshotEntities(entities)
}

export const duplicateNode = (entity?: Entity) => {
  const entities = getSelectedEntities(entity)
  EditorControlFunctions.duplicateObject(entities)
  AuthoringState.snapshotEntities(entities)
}

export const groupNodes = (entity?: Entity) => {
  const entities = getSelectedEntities(entity)
  EditorControlFunctions.groupObjects(entities)
  AuthoringState.snapshotEntities
}

export const ungroupNodes = (entity?: Entity) => {
  const entities = getSelectedEntities(entity)
  EditorControlFunctions.ungroupObjects(entities)
  AuthoringState.snapshotEntities(entities)
}

export const copyNodes = (entity?: Entity) => {
  CopyPasteFunctions.copyEntities(getSelectedEntities(entity))
}

export const pasteNodes = (parentEntity?: Entity) => {
  let parentEntities = [parentEntity] as Entity[]
  if (!parentEntity) {
    parentEntities = getSelectedEntities(parentEntity)
  }

  const ProcessEntityData = (parentEntity: Entity | undefined, nodeEntitiesData: EntityCopyDataType[]) => {
    nodeEntitiesData.forEach((nodeEntityData) => {
      const components = nodeEntityData.components.map((c) => ({ name: c.name, props: c.json }) as ComponentJsonType)
      delete components[UUIDComponent.jsonID]

      const entityData = EditorControlFunctions.createObjectFromSceneElement(
        components,
        parentEntity,
        getSelectedEntities(parentEntity)[0],
        nodeEntityData.name
      )
      const newEntity = UUIDComponent.getEntityByUUID(entityData.entityUUID, Layers.Authoring)
      ProcessEntityData(newEntity, nodeEntityData.children)
    })
  }

  CopyPasteFunctions.getPastedEntities()
    .then((nodeEntitiesData) => {
      parentEntities.forEach((entity) => {
        ProcessEntityData(entity, nodeEntitiesData)
      })
      AuthoringState.snapshotEntities(parentEntities)
    })
    .catch(() => {
      NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes') as string, {
        variant: 'error'
      })
    })
}

type WalkerEntry = {
  entity: Entity
  depth: number
  lastChild: boolean
  isRendered: boolean
}

export function ecsHierarchyTreeWalker(rootEntity: Entity, enableHideGlbChildren: boolean): HierarchyTreeNodeType[] {
  const result: HierarchyTreeNodeType[] = []
  const frontier: WalkerEntry[] = [{ entity: rootEntity, depth: 0, lastChild: true, isRendered: true }]
  while (frontier.length > 0) {
    const { entity, depth, lastChild, isRendered: originalIsRendered } = frontier.pop()!
    const eTree = getOptionalComponent(entity, EntityTreeComponent)
    const parentEntity = eTree?.parentEntity

    if (!eTree) continue
    const childIndex = eTree.childIndex ?? 0
    const children = eTree.children

    //@todo temporary check for glb so we don't display children we can't save edits to
    const hideChildren = isEntityGlb(entity) && enableHideGlbChildren
    const isLeaf = !children || children.length === 0 || hideChildren //check glb here to hide expansion chevron
    const sourceID = UUIDComponent.get(rootEntity)
    const isCollapsed = !getState(HierarchyTreeState).expandedNodes[sourceID]?.[entity]
    const isRendered = originalIsRendered && !isCollapsed
    result.push({
      entity,
      depth,
      childIndex,
      lastChild,
      isLeaf,
      isCollapsed,
      isRendered: originalIsRendered,
      parentEntity
    })
    if (children && !hideChildren) {
      //do not push children of glb
      for (let i = children.length - 1; i >= 0; i--) {
        frontier.push({ entity: children[i], depth: depth + 1, lastChild: i === 0, isRendered })
      }
    }
  }
  return result
}
