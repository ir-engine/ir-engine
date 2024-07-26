/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import * as fs from 'fs'
import { isEqual } from 'lodash-es'
import mime from 'mime-types'
import path from 'path'

export const getContentType = (url: string): string => {
  return /\.ts$/.exec(url) ? 'application/octet-stream' : mime.lookup(url) || 'application/octet-stream'
}

export type DirectorySnapshot = {
  modified: number
  files: {
    uri: string
    modified: number
  }[]
}

export function snapshot(directory: string): DirectorySnapshot {
  let dirModified = 0
  const files = fs.readdirSync(directory).map((file) => {
    const uri = path.join(directory, file)
    const stat = fs.statSync(uri)
    const modified = stat.mtime.getDate()
    dirModified = Math.max(dirModified, modified)
    return { uri, modified }
  })
  return {
    modified: dirModified,
    files
  }
}

export function delta(shot1: DirectorySnapshot, shot2: DirectorySnapshot): DirectorySnapshot {
  return {
    modified: shot2.modified,
    files: shot2.files.filter((file) => !shot1.files.find((oldFile) => isEqual(file, oldFile)))
  }
}
