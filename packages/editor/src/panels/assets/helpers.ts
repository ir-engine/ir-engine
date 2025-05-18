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

import { AssetCategoryNode } from './categories'

export type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
  path?: string
}

export function iterativelyListTags(categories): string[] {
  const tags: string[] = []

  for (const category of categories) {
    tags.push(category.name)
    if (category.children.length > 0) {
      tags.push(...iterativelyListTags(category.children))
    }
  }

  return tags
}

export const ASSETS_PAGE_LIMIT = 10

export const calculateItemsToFetch = () => {
  const parentElement = document.getElementById('asset-panel')?.getBoundingClientRect()
  const containerHeight = parentElement ? parentElement.width : 0
  const containerWidth = parentElement ? parentElement.height : 0
  const item = document.getElementsByClassName('resource-file')[0]?.getBoundingClientRect()

  const defaultSize = 160
  const itemHeight = Math.floor((item ? item.height : defaultSize) * window.devicePixelRatio)
  const itemWidth = Math.floor((item ? item.width : defaultSize) * window.devicePixelRatio)

  const itemsInRow = Math.ceil(containerWidth / itemWidth)
  const numberOfRows = Math.ceil(containerHeight / itemHeight)
  return itemsInRow * numberOfRows
}

export function findCategoryByPath(nodes: AssetCategoryNode[], targetPath: string): AssetCategoryNode | null {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node
    }

    const foundInChildren = findCategoryByPath(node.children, targetPath)
    if (foundInChildren) {
      return foundInChildren
    }
  }

  return null
}

export function convertToHierarchy(obj: Record<string, any>, depth = 0, parentPath = ''): AssetCategoryNode[] {
  return Object.entries(obj).map(([key, value]) => {
    const currentPath = parentPath ? `${parentPath}/${key}` : key

    return {
      name: key,
      path: currentPath,
      depth,
      children: convertToHierarchy(value, depth + 1, currentPath)
    }
  })
}
