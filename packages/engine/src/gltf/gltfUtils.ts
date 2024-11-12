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

import { GLTF } from '@gltf-transform/core'
import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'

export function nodeIsChild(index: number, nodes: GLTF.INode[]) {
  for (const node of nodes) {
    if (node.children && node.children.includes(index)) return true
  }

  return false
}

const replaceUUID = (obj: object | null, prevUUID: EntityUUID, newUUID: EntityUUID) => {
  if (!obj) return
  for (const key in obj) {
    if (obj[key] === prevUUID) obj[key] = newUUID
    else if (typeof obj[key] === 'object') replaceUUID(obj[key], prevUUID, newUUID)
  }
}

export function gltfReplaceUUIDReferences(gltf: GLTF.IGLTF, prevUUID: EntityUUID, newUUID: EntityUUID) {
  if (!gltf.nodes) return

  for (const node of gltf.nodes) {
    if (!node.extensions) continue

    for (const extKey in node.extensions) {
      if (extKey === UUIDComponent.jsonID) continue

      const ext = node.extensions[extKey]
      // If a component is just a reference to a uuid
      if (ext === prevUUID) node.extensions[extKey] = newUUID
      else if (typeof ext === 'object') {
        replaceUUID(ext, prevUUID, newUUID)
      }
    }
  }
}
